import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    User,
    MoreVertical,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    WifiOff
} from 'lucide-react'
import { fetchPatients } from '../../store/slices/patientSlice'

const PatientList = () => {
    const dispatch = useDispatch()
    const { patients = [], pagination = {}, loading, error } = useSelector((state) => state.patient || {})
    const { queue = [] } = useSelector((state) => state.sync || {})
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        dispatch(fetchPatients({ page: 1 }))
    }, [dispatch])

    const handleSearch = (e) => {
        e.preventDefault()
        dispatch(fetchPatients({ search: searchTerm }))
    }

    // Identify patients that are currently in the sync queue
    const queuedPatients = (queue || [])
        .filter(item => item.url === '/patients' && item.method === 'post')
        .map(item => ({
            id: item.id,
            ...item.data,
            isQueued: true
        }))

    const allPatients = [...queuedPatients, ...(Array.isArray(patients) ? patients : [])]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and view all registered patients.</p>
                </div>
                <Link
                    to="/patients/new"
                    className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Register Patient
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                </form>
                <div className="flex gap-2">
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </button>
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                        <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {allPatients.map((patient) => (
                                <motion.tr
                                    key={patient.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3 border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{patient.first_name} {patient.last_name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{patient.date_of_birth}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">#{patient.patient_number || 'PENDING'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${patient.gender === 'male'
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                                            }`}>
                                            {patient.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{patient.phone}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{patient.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.isQueued ? (
                                            <div className="flex items-center text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full w-fit">
                                                <WifiOff className="w-3 h-3 mr-1.5" /> Pending Sync
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full w-fit">
                                                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Registered
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/patients/${patient.id}`}
                                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all inline-block"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                            {allPatients.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-bold text-slate-900 dark:text-white">1</span> to <span className="font-bold text-slate-900 dark:text-white">{allPatients.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{pagination?.total || allPatients.length}</span> entries
                    </p>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatientList
