import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Save, ArrowLeft, User, Search, Microscope, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchPatients } from '../../store/slices/patientSlice';
import { createLabRequest, fetchLabTests } from '../../store/slices/labSlice';

const requestSchema = z.object({
    patient_id: z.string().min(1, 'Patient is required'),
    test_id: z.string().min(1, 'Test is required'),
    priority: z.enum(['routine', 'urgent', 'stat']),
    clinical_notes: z.string().optional(),
});

const LabRequestForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Patient Search State
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientResults, setShowPatientResults] = useState(false);
    const { patients, loading: patientsLoading } = useSelector(state => state.patient);

    // Lab Tests State
    const { tests, loading: testsLoading } = useSelector(state => state.lab);

    const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            priority: 'routine'
        }
    });

    useEffect(() => {
        dispatch(fetchLabTests({}));
    }, [dispatch]);

    // Patient Search Effect
    useEffect(() => {
        if (patientSearch.length > 2) {
            const timeoutId = setTimeout(() => {
                dispatch(fetchPatients({ search: patientSearch }));
                setShowPatientResults(true);
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setShowPatientResults(false);
        }
    }, [patientSearch, dispatch]);

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setValue('patient_id', patient.id);
        setPatientSearch(`${patient.first_name} ${patient.last_name}`);
        setShowPatientResults(false);
    };

    const onSubmit = async (data) => {
        try {
            await dispatch(createLabRequest(data)).unwrap();
            toast.success('Lab request created successfully');
            navigate('/lab');
        } catch (error) {
            toast.error(error || 'Failed to create request');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/lab')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Lab Request</h1>
                    <p className="text-sm text-slate-500">Order a new diagnostic test for a patient.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">

                {/* Patient Selection */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Patient</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            placeholder="Search Patient Name or ID..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white"
                        />
                        {showPatientResults && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                                {patientsLoading ? (
                                    <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
                                ) : patients.length > 0 ? (
                                    patients.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handlePatientSelect(p)}
                                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{p.first_name} {p.last_name}</p>
                                                <p className="text-xs text-slate-500">#{p.patient_number}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-slate-500">No patients found.</div>
                                )}
                            </div>
                        )}
                    </div>
                    {errors.patient_id && <p className="text-xs text-red-500">{errors.patient_id.message}</p>}

                    {selectedPatient && (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                                {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                <p className="text-xs text-slate-500 dark:text-indigo-300">{selectedPatient.email || selectedPatient.phone}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Test Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Lab Test</label>
                    <div className="relative">
                        <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            {...register('test_id')}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white appearance-none"
                        >
                            <option value="">Select a test...</option>
                            {tests.map(test => (
                                <option key={test.id} value={test.id}>
                                    {test.test_name} ({test.test_code}) - KES {test.price}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.test_id && <p className="text-xs text-red-500">{errors.test_id.message}</p>}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Priority</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['routine', 'urgent', 'stat'].map((p) => (
                            <label key={p} className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    value={p}
                                    {...register('priority')}
                                    className="peer sr-only"
                                />
                                <div className="p-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition-all text-sm font-bold capitalize">
                                    {p}
                                </div>
                            </label>
                        ))}
                    </div>
                    {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
                </div>

                {/* Clinical Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Clinical Notes</label>
                    <textarea
                        {...register('clinical_notes')}
                        rows="4"
                        placeholder="Reason for test, symptoms, or special instructions..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white resize-none"
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LabRequestForm;
