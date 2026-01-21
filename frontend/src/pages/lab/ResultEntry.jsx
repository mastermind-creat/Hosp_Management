import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Save, ArrowLeft, FlaskConical, AlertTriangle, FileText, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { enterLabResult, fetchLabRequests } from '../../store/slices/labSlice';
import { format } from 'date-fns';

const resultSchema = z.object({
    result_value: z.string().min(1, 'Result value is required'),
    unit: z.string().optional(),
    interpretation: z.string().optional(),
    is_abnormal: z.boolean().default(false),
    technician_notes: z.string().optional(),
});

const ResultEntry = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { requests, loading } = useSelector(state => state.lab);
    const [request, setRequest] = useState(null);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(resultSchema),
        defaultValues: {
            is_abnormal: false
        }
    });

    const isAbnormal = watch('is_abnormal');

    useEffect(() => {
        // If requests aren't loaded, fetch them (or ideally a single fetch)
        if (requests.length === 0) {
            dispatch(fetchLabRequests({}));
        } else {
            const found = requests.find(r => r.id === id);
            if (found) setRequest(found);
        }
    }, [id, requests, dispatch]);

    const onSubmit = async (data) => {
        try {
            await dispatch(enterLabResult({ requestId: id, data })).unwrap();
            toast.success('Results entered successfully');
            navigate('/lab');
        } catch (error) {
            toast.error(error || 'Failed to submit results');
        }
    };

    if (loading || !request) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/lab')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enter Test Results</h1>
                    <p className="text-sm text-slate-500">Record diagnostic findings for {request.request_number}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Details */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> Request Details
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Patient</p>
                                <p className="font-semibold dark:text-white">{request.patient?.first_name} {request.patient?.last_name}</p>
                                <p className="text-slate-400">{request.patient?.patient_number}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Test</p>
                                <p className="font-semibold dark:text-white">{request.test?.test_name}</p>
                                <p className="text-slate-400">{request.test?.test_code}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Requested By</p>
                                <p className="font-semibold dark:text-white">{request.requester?.name}</p>
                                <p className="text-slate-400">{format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}</p>
                            </div>
                            {request.clinical_notes && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">Clinical Notes</p>
                                    <p className="text-slate-600 dark:text-slate-300 italic">{request.clinical_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Result Entry Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Value</label>
                                <input
                                    {...register('result_value')}
                                    type="text"
                                    placeholder="e.g. 5.4 or Negative"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                />
                                {errors.result_value && <p className="text-xs text-red-500 mt-1">{errors.result_value.message}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Unit</label>
                                <input
                                    {...register('unit')}
                                    type="text"
                                    placeholder="e.g. mmol/L"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                <input
                                    type="checkbox"
                                    {...register('is_abnormal')}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <div className="flex-1">
                                    <span className={`font-bold transition-colors ${isAbnormal ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                        Flag as Abnormal Result
                                    </span>
                                    <p className="text-xs text-slate-500">Check this if the result falls outside standard reference ranges.</p>
                                </div>
                                {isAbnormal && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
                            </label>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Interpretation</label>
                            <textarea
                                {...register('interpretation')}
                                rows="3"
                                placeholder="Summary or clinical interpretation of the result..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Technician Notes</label>
                            <textarea
                                {...register('technician_notes')}
                                rows="2"
                                placeholder="Internal notes (optional)..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/lab')}
                                className="px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Submit Results
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResultEntry;
