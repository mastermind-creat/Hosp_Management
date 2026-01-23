import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity, Search, Filter, Plus, User,
    ChevronRight, Clock, MapPin, RefreshCw, ArrowRightLeft
} from 'lucide-react';
import { fetchPatientVisits } from '../../store/slices/clinicalSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import TransferModal from '../../components/clinical/TransferModal';

const ClinicalQueue = () => {
    const navigate = useNavigate();
    const [queueData, setQueueData] = useState({ waiting: [], active: [], department: null });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState('waiting'); // 'waiting' or 'active'
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await api.get('/queues/my-queue');
            setQueueData(response.data);
        } catch (error) {
            console.error('Failed to fetch clinical queue');
            toast.error('Failed to load your department queue');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAttending = async (visitId) => {
        try {
            await api.post(`/queues/visits/${visitId}/start`);
            toast.success('Patient session started');
            fetchQueue();
            setTab('active');
        } catch (error) {
            toast.error('Failed to start session');
        }
    };

    const currentQueue = tab === 'waiting' ? queueData.waiting : queueData.active;

    const filteredVisits = (currentQueue || []).filter(v =>
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
                        {queueData.department?.name || 'Clinical'} Queue
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {queueData.department?.description || 'Monitoring active patient visits and consultations'}
                    </p>
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

            {/* Tabs & Search */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button
                        onClick={() => setTab('waiting')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'waiting'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                    >
                        Waiting ({queueData.waiting?.length || 0})
                    </button>
                    <button
                        onClick={() => setTab('active')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'active'
                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                    >
                        Active ({queueData.active?.length || 0})
                    </button>
                </div>

                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient in queue..."
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Queue List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 h-56 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"></div>
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
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-slate-600">
                                            {visit.patient?.first_name?.charAt(0)}{visit.patient?.last_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {visit.patient?.first_name} {visit.patient?.last_name}
                                            </h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">#{visit.patient?.patient_number}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${visit.priority === 'emergency' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        visit.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {visit.priority}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="font-medium">Queued:</span>
                                        <span className="ml-auto">{new Date(visit.queued_at || visit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />
                                        <span className="font-medium mr-2">Complaint:</span>
                                        <span className="italic line-clamp-1">{visit.chief_complaint || 'No complaint specified'}</span>
                                    </div>
                                </div>

                                {tab === 'waiting' ? (
                                    <button
                                        onClick={() => handleStartAttending(visit.id)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
                                    >
                                        Start Attending <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/clinical/encounters/${visit.patient_id}`)}
                                            className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all text-sm"
                                        >
                                            Consultation
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedVisit(visit);
                                                setIsTransferOpen(true);
                                            }}
                                            className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm flex items-center justify-center gap-1"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" /> Transfer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white dark:bg-slate-800 p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Queue Empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">There are no patients currently {tab === 'waiting' ? 'waiting in' : 'active at'} this department.</p>
                    </div>
                )}
            </div>

            {selectedVisit && (
                <TransferModal
                    isOpen={isTransferOpen}
                    onClose={() => {
                        setIsTransferOpen(false);
                        setSelectedVisit(null);
                    }}
                    visitId={selectedVisit.id}
                    patientName={`${selectedVisit.patient?.first_name} ${selectedVisit.patient?.last_name}`}
                    onTransferred={fetchQueue}
                />
            )}
        </div>
    );
};

export default ClinicalQueue;
