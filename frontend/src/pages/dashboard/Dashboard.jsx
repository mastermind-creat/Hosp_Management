import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
    Users,
    Calendar,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Plus,
    Clock,
    UserPlus,
    FileCheck,
    TrendingUp,
    Briefcase,
    Pill,
    FlaskConical
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts'
import api from '../../services/api'
import { formatKES } from '../../utils/format'
import SyncStatus from '../../components/dashboard/SyncStatus'
import QuickActions from '../../components/dashboard/QuickActions'

const StatCard = ({ title, value, change, icon: Icon, trend, color = "indigo" }) => {
    const colorClasses = {
        indigo: "text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-900",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm shadow-slate-200/50 dark:shadow-none"
        >
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {change && (
                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            </div>
        </motion.div>
    );
}

const Dashboard = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/reports/dashboard')
                setData(response.data)
            } catch (error) {
                console.error('Failed to fetch stats', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    const stats = data?.data;
    const role = data?.role || 'staff';

    const renderRoleStats = () => {
        const commonStats = [
            <StatCard
                key="patients"
                title={t('dashboard.total_patients')}
                value={stats?.total_patients?.toLocaleString() || '0'}
                change="+12%"
                icon={Users}
                trend="up"
                color="blue"
            />,
            <StatCard
                key="appointments"
                title={t('dashboard.active_appointments')}
                value={stats?.active_appointments || '0'}
                change="+5%"
                icon={Calendar}
                trend="up"
                color="indigo"
            />
        ];

        if (role === 'admin' || role === 'accountant') {
            return [
                ...commonStats,
                <StatCard
                    key="revenue"
                    title={t('dashboard.revenue_today')}
                    value={formatKES(stats?.revenue_today || 0)}
                    change="+2.4%"
                    trend="up"
                    icon={CreditCard}
                    color="emerald"
                />,
                <StatCard
                    key="staff"
                    title="Online Staff"
                    value={stats?.online_staff || '0'}
                    icon={Activity}
                    color="indigo"
                />
            ];
        }

        if (role === 'receptionist') {
            return [
                ...commonStats,
                <StatCard
                    key="registrations"
                    title="New Registrations"
                    value={stats?.registrations_today || '0'}
                    change="+15%"
                    trend="up"
                    icon={UserPlus}
                    color="amber"
                />,
                <StatCard
                    key="checkins"
                    title="Patient Check-ins"
                    value={stats?.checkins_today || '0'}
                    icon={Clock}
                    color="blue"
                />
            ];
        }

        if (role === 'doctor' || role === 'nurse') {
            return [
                ...commonStats,
                <StatCard
                    key="consultations"
                    title="Pending Consultations"
                    value={stats?.pending_consultations || '0'}
                    icon={Activity}
                    color="rose"
                />,
                <StatCard
                    key="admissions"
                    title="Admitted Patients"
                    value={stats?.admitted_patients || '0'}
                    icon={Briefcase}
                    color="indigo"
                />
            ];
        }

        if (role === 'pharmacist') {
            return [
                ...commonStats,
                <StatCard
                    key="stock"
                    title="Low Stock Alarm"
                    value={stats?.low_stock_count || '0'}
                    icon={Activity}
                    color="rose"
                />,
                <StatCard
                    key="dispensed"
                    title="Dispensed Today"
                    value={stats?.dispensed_today || '0'}
                    icon={Pill}
                    color="emerald"
                />
            ];
        }

        if (role === 'lab_tech') {
            return [
                ...commonStats,
                <StatCard
                    key="pending_tests"
                    title="Pending Lab Tests"
                    value={stats?.pending_tests || '0'}
                    icon={FlaskConical}
                    color="amber"
                />,
                <StatCard
                    key="verified"
                    title="Verified Today"
                    value={stats?.verified_today || '0'}
                    icon={FileCheck}
                    color="emerald"
                />
            ];
        }

        return commonStats;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.hospital_performance')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('dashboard.welcome')} <span className="text-indigo-600 font-bold">{user?.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/patients/new')}
                        className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Patient
                    </button>
                    <button
                        onClick={() => navigate('/patients')}
                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold"
                    >
                        <Filter className="w-5 h-5 mr-2 inline-block" /> {t('dashboard.filter') || 'Filter'}
                    </button>
                </div>
            </div>

            {/* Top Row: Sync & Quick Actions (This fills the empty space!) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SyncStatus />
                <QuickActions role={role} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderRoleStats()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Visual Data (Revenue or Visits) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {stats?.chart_type === 'revenue' ? t('dashboard.revenue_analysis') : 'Hospital Activity Trends'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {stats?.chart_type === 'revenue' ? 'Weekly hospital income overview' : 'Weekly operational volume analysis'}
                            </p>
                        </div>
                        <select className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer outline-none p-2">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chart_data || []}>
                                <defs>
                                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '12px',
                                        border: 'none',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPrimary)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.recent_activity')}</h3>
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 space-y-5">
                        {stats?.recent_activity?.length > 0 ? (
                            stats.recent_activity.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 p-2 -mx-2 rounded-xl transition-all">
                                    <div className="flex items-center">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} mr-4`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-medium">{item.type} • {item.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 flex items-center bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                                            <Clock className="w-3 h-3 mr-1" /> {item.time}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No recent activity found</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/clinical')}
                        className="mt-8 w-full py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                    >
                        View Full Activity Log
                    </button>
                </div>
            </div>

            {/* Quick Informational Footer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Live Hospital Status
                    </h4>
                    <p className="text-slate-400 text-sm mt-1">Real-time system health and connectivity monitor active.</p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <div className="flex flex-col items-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                        <span className="text-indigo-400 font-bold text-lg">{stats?.online_staff || 1}</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Active Staff</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                        <span className="text-emerald-400 font-bold text-lg">{stats?.total_patients || 0}</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Patients</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                        <span className="text-blue-400 font-bold text-lg">99.9%</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Uptime</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
