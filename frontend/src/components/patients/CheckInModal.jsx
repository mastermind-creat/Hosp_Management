import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const CheckInModal = ({ isOpen, onClose, patient, onCheckedIn }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        department_id: '',
        priority: 'normal',
        chief_complaint: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
        }
    }, [isOpen]);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/departments');
            // Show all departments as requested
            const allDepts = response.data.data || response.data;
            setDepartments(allDepts);

            // Set default to Triage if available
            const triage = allDepts.find(d => d.name === 'Triage');
            if (triage) {
                setFormData(prev => ({ ...prev, department_id: triage.id }));
            }
        } catch (error) {
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.department_id) {
            toast.error('Please select a department');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/queues/check-in', {
                patient_id: patient.id,
                ...formData
            });
            toast.success('Patient checked in successfully');
            onCheckedIn();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to check in patient');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-indigo-600" />
                            Patient Check-In
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Queue patient for clinical service</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Patient Context */}
                    <div className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Patient Name</p>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                {patient.first_name} {patient.last_name}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-medium">#{patient.patient_number}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{patient.gender}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Select Department */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Destination Department</label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Priority Level</label>
                            <div className="relative">
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chief Complaint */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Chief Complaint / Reason</label>
                        <textarea
                            rows="3"
                            value={formData.chief_complaint}
                            onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                            placeholder="Briefly state why the patient is visiting today..."
                        ></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="flex-[2] px-4 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5" />
                            )}
                            Confirm Check-In
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CheckInModal;
