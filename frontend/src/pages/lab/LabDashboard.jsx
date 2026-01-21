import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity, ClipboardList, Clock, CheckCircle,
    AlertCircle, Search, Filter, Plus, Microscope
} from 'lucide-react';
import { fetchLabRequests } from '../../store/slices/labSlice';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const LabDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { requests, loading } = useSelector(state => state.lab);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchLabRequests({ status: statusFilter !== 'all' ? statusFilter : undefined }));
    }, [dispatch, statusFilter]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'sample_collected': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Laboratory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage test requests, samples, and results</p>
                </div>
                <button
                    onClick={() => navigate('/lab/requests/new')}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Request
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Requests</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{requests.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{requests.filter(r => r.status === 'pending').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        <Microscope className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Processing</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{requests.filter(r => r.status === 'sample_collected').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{requests.filter(r => r.status === 'completed').length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {['all', 'pending', 'sample_collected', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === tab
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm dark:text-white"
                    />
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Test</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/20"></td>
                                    </tr>
                                ))
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-900 dark:text-white">
                                            {req.request_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {req.patient?.first_name} {req.patient?.last_name}
                                            </div>
                                            <div className="text-xs text-slate-500">{req.patient?.patient_number}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {req.test?.test_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${req.priority === 'urgent' || req.priority === 'stat'
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {req.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(req.status)}`}>
                                                {req.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {format(new Date(req.created_at), 'MMM d, H:mm')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'sample_collected' || req.status === 'pending' ? (
                                                <button
                                                    onClick={() => navigate(`/lab/requests/${req.id}/results`)}
                                                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold text-sm"
                                                >
                                                    Enter Result
                                                </button>
                                            ) : (
                                                <button className="text-slate-500 hover:text-slate-700 font-medium text-sm">
                                                    View Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">
                                        No requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LabDashboard;
