import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
    User,
    Calendar,
    Clock,
    FileText,
    Activity,
    Pill,
    FlaskConical,
    ArrowLeft,
    Edit,
    Plus,
    History,
    MoreHorizontal,
    Phone,
    Mail,
    MapPin,
    ShieldCheck
} from 'lucide-react'
import { fetchPatientById } from '../../store/slices/patientSlice'
import { fetchPatientVisits } from '../../store/slices/clinicalSlice'
import { format } from 'date-fns'

const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 text-slate-800 dark:text-white mb-6">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-bold">{title}</h2>
    </div>
)

const HistoryTab = ({ encounters, loading }) => {
    if (loading) return <div className="text-center py-10 text-slate-500">Loading history...</div>;
    if (!encounters || encounters.length === 0) {
        return (
            <div className="text-center py-20">
                <History className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Encounters Registry</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Historical data will appear here after the patient visits the clinic.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <SectionTitle title="Medical Timeline" icon={History} />
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {encounters.map((encounter) => (
                    <div key={encounter.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <time className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                    {format(new Date(encounter.visit_date), 'MMM dd, yyyy')}
                                </time>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                                    {encounter.visit_type}
                                </span>
                            </div>
                            <div className="text-slate-800 dark:text-white font-bold mb-1">
                                {encounter.diagnosis || 'No diagnosis recorded'}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                                {encounter.chief_complaint || 'No complaint details recorded.'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PatientProfile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentPatient, loading: patientLoading, error: patientError } = useSelector((state) => state.patient)
    const { encounters, loading: clinicalLoading } = useSelector((state) => state.clinical)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        dispatch(fetchPatientById(id))
        dispatch(fetchPatientVisits(id))
    }, [dispatch, id])

    if (patientLoading) return <div className="p-8 text-center text-slate-500">Loading patient profile...</div>
    if (patientError) return <div className="p-8 text-center text-red-500">Error: {patientError}</div>
    if (!currentPatient) return <div className="p-8 text-center text-slate-500">Patient not found</div>

    const tabs = [
        { id: 'overview', name: 'Overview', icon: User },
        { id: 'history', name: 'Visit History', icon: History },
        { id: 'billing', name: 'Billing', icon: FileText },
        { id: 'clinical', name: 'Clinical Notes', icon: Activity },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/patients')}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {currentPatient.first_name} {currentPatient.last_name}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Patient ID: #{currentPatient.patient_number}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to={`/patients/${id}/edit`}
                        className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                    >
                        <Edit className="w-4 h-4 mr-2" /> Edit Records
                    </Link>
                    <Link
                        to={`/clinical/encounters/${id}`}
                        className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Encounter
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col items-center pb-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100 dark:border-indigo-800">
                                <User className="w-10 h-10" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentPatient.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                {currentPatient.gender}
                            </span>
                        </div>
                        <div className="pt-6 space-y-4">
                            <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 text-slate-400 mr-3" />
                                <span className="text-slate-500 dark:text-slate-400 w-20">Age:</span>
                                <span className="text-slate-900 dark:text-white font-medium">
                                    {currentPatient.date_of_birth ? format(new Date(currentPatient.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 text-slate-400 mr-3" />
                                <span className="text-slate-500 dark:text-slate-400 w-20">Phone:</span>
                                <span className="text-slate-900 dark:text-white font-medium">{currentPatient.phone}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Mail className="w-4 h-4 text-slate-400 mr-3" />
                                <span className="text-slate-500 dark:text-slate-400 w-20">Email:</span>
                                <span className="text-slate-900 dark:text-white font-medium truncate">{currentPatient.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-start text-sm">
                                <MapPin className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                                <span className="text-slate-500 dark:text-slate-400 w-20">Address:</span>
                                <span className="text-slate-900 dark:text-white font-medium flex-1">{currentPatient.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-bold">Next of Kin</h3>
                        </div>
                        <p className="text-sm font-bold">{currentPatient.emergency_contact_name}</p>
                        <p className="text-sm text-slate-400 dark:text-indigo-100 mt-1">{currentPatient.emergency_contact_phone}</p>
                    </div>
                </div>

                {/* Right Column - Tabs & Details */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <section>
                                    <SectionTitle title="Vitals Summary" icon={Activity} />
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Weight', value: encounters[0]?.vitals?.weight ? `${encounters[0].vitals.weight}kg` : '--', change: 'Latest' },
                                            { label: 'BP', value: encounters[0]?.vitals?.blood_pressure || '--', change: 'Latest' },
                                            { label: 'Pulse', value: encounters[0]?.vitals?.pulse_rate || '--', change: 'Latest' },
                                            { label: 'Temp', value: encounters[0]?.vitals?.temperature ? `${encounters[0].vitals.temperature}°C` : '--', change: 'Latest' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{item.label}</p>
                                                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</p>
                                                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 uppercase tracking-wider">{item.change}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <SectionTitle title="Recent Prescriptions" icon={Pill} />
                                        <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
                                            <p className="text-xs text-slate-400">Prescription records integration coming soon.</p>
                                        </div>
                                    </section>
                                    <section>
                                        <SectionTitle title="Lab Investigations" icon={FlaskConical} />
                                        <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
                                            <p className="text-xs text-slate-400">Lab modules are currently in Phase 4.</p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <HistoryTab encounters={encounters} loading={clinicalLoading} />
                        )}

                        {activeTab === 'billing' && (
                            <div className="text-center py-20">
                                <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Finance & Invoices</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">All billing statements and payment records will be shown here.</p>
                            </div>
                        )}

                        {activeTab === 'clinical' && (
                            <div className="text-center py-20">
                                <Activity className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medical Documentation</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Physician notes and treatment summaries will be accessible here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatientProfile;
