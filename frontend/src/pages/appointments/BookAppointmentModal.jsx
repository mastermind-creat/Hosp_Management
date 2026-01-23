import React, { useState, useEffect } from 'react';
import { X, User, Calendar as CalendarIcon, Clock, AlertCircle, Search, Plus } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const BookAppointmentModal = ({ isOpen, onClose, onSuccess, selectedDate }) => {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchPatient, setSearchPatient] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: selectedDate || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        duration: '20',
        reason: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, appointment_date: selectedDate }));
    }, [selectedDate]);

    const fetchInitialData = async () => {
        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                api.get('/patients?per_page=100'),
                api.get('/users?role=doctor,nurse,clinical_assistant,clinic_manager&limit=100')
            ]);
            setPatients(patientsRes.data.data || patientsRes.data);

            // Clinical roles that can be selected as clinicians
            const clinicalRoleNames = ['doctor', 'nurse', 'clinical_assistant', 'clinic_manager'];

            const allUsers = doctorsRes.data.data || doctorsRes.data;
            setDoctors(allUsers.filter(u =>
                (u.roles && u.roles.some(r => clinicalRoleNames.includes(r.name.toLowerCase()))) ||
                (u.role && (clinicalRoleNames.includes(u.role.name?.toLowerCase()) || clinicalRoleNames.includes(u.role.toLowerCase())))
            ));
        } catch (error) {
            toast.error('Failed to load clinical data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate end time
            const [hours, minutes] = formData.start_time.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours, minutes + parseInt(formData.duration));
            const end_time = endDate.toTimeString().substring(0, 5);

            await api.post('/appointments', {
                ...formData,
                end_time
            });

            toast.success('Appointment booked successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredPatients = Array.isArray(patients) ? patients.filter(p => {
        const name = p.name || `${p.first_name} ${p.last_name}`;
        const searchLower = searchPatient.toLowerCase();
        return name.toLowerCase().includes(searchLower) ||
            (p.patient_number && p.patient_number.toLowerCase().includes(searchLower));
    }) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Book New Appointment</h2>
                        <p className="text-sm text-slate-500">Schedule a clinical encounter</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Selection */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-500" /> Patient
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search patient name or number..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={searchPatient}
                                    onChange={(e) => setSearchPatient(e.target.value)}
                                />
                            </div>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.patient_id}
                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                            >
                                <option value="">Select a patient from results</option>
                                {filteredPatients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name || `${p.first_name} ${p.last_name}`} ({p.patient_number})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Doctor Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor / Clinician</label>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.doctor_id}
                                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.appointment_date}
                                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="time"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Duration (min)</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            >
                                <option value="15">15 min</option>
                                <option value="20">20 min</option>
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">60 min</option>
                            </select>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reason for Visit</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Consultation, follow-up, etc."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.patient_id || !formData.doctor_id}
                            className="flex-3 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
