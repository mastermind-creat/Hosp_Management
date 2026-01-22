import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity, Search, Filter, Plus, User,
    ChevronRight, Clock, MapPin, RefreshCw
} from 'lucide-react';
import { fetchPatientVisits } from '../../store/slices/clinicalSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ClinicalQueue = () => {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clinical/visits?status=active');
            setVisits(response.data.data);
        } catch (error) {
            console.error('Failed to fetch clinical queue');
        } finally {
            setLoading(false);
        }
    };

    const filteredVisits = visits.filter(v =>
        v.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visit_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-600" />
                        Clinical Queue
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Monitoring active patient visits and consultations</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchQueue}
                        className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate('/patients')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Start New Visit
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search queue by name or visit ID..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                        <option>All Depts</option>
                        <option>OPD</option>
                        <option>IPD</option>
                        <option>Emergency</option>
                    </select>
                </div>
            </div>

            {/* Queue List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 h-48 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"></div>
                    ))
                ) : filteredVisits.length > 0 ? (
                    filteredVisits.map((visit) => (
                        <div
                            key={visit.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg">
                                            {visit.patient?.first_name?.charAt(0)}{visit.patient?.last_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {visit.patient?.first_name} {visit.patient?.last_name}
                                            </h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{visit.visit_number}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${visit.visit_type === 'emergency' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                        {visit.visit_type}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                        Waiting: {new Date(visit.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                        Triaged - Vitals Stable
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/clinical/encounters/${visit.patient_id}`)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 transition-all"
                                >
                                    Open Consultation <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white dark:bg-slate-800 p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Queue Empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">There are no active visits pending consultation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClinicalQueue;
