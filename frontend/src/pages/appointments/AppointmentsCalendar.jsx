import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Clock, ChevronLeft,
    ChevronRight, Plus, User, Search, Filter
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AppointmentsCalendar = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/appointments?date=${selectedDate}`);
            setAppointments(response.data);
        } catch (error) {
            console.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            arrived: 'bg-blue-50 text-blue-700 border-blue-100',
            cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
        };
        return styles[status] || 'bg-slate-50 text-slate-700 border-slate-100';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-indigo-600" />
                        Scheduling Console
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage patient bookings and clinical schedules</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Plus className="w-4 h-4 mr-2" /> Book Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Date Picker Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Calendar</h3>
                            <div className="flex gap-1">
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                        <h4 className="font-bold text-lg mb-2">Daily Summary</h4>
                        <div className="space-y-4 pt-4 border-t border-indigo-500/50">
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-100 text-sm">Total Bookings</span>
                                <span className="text-xl font-bold">{appointments.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-100 text-sm">Confirmed</span>
                                <span className="text-xl font-bold">
                                    {appointments.filter(a => a.status === 'confirmed').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slots/Timeline */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="p-6 animate-pulse flex gap-4">
                                        <div className="w-20 h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                        <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    </div>
                                ))
                            ) : appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="md:w-32 flex flex-col">
                                            <span className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {apt.start_time.substring(0, 5)}
                                            </span>
                                            <span className="text-xs text-slate-400">Duration: 20m</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <p className="font-bold text-slate-900 dark:text-white">{apt.patient.name}</p>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(apt.status)}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Seeing: <span className="text-indigo-600 font-medium">{apt.doctor.name}</span>
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800">
                                                Update Status
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CalendarIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 italic">No appointments booked for this day.</p>
                                    <button className="mt-4 text-indigo-600 font-bold hover:underline">
                                        + Book New Slot
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsCalendar;
