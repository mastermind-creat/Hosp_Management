import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    FileCheck
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

const data = [
    { name: 'Mon', patients: 40, revenue: 240000 },
    { name: 'Tue', patients: 30, revenue: 139800 },
    { name: 'Wed', patients: 45, revenue: 380000 },
    { name: 'Thu', patients: 35, revenue: 390800 },
    { name: 'Fri', patients: 55, revenue: 480000 },
    { name: 'Sat', patients: 20, revenue: 280000 },
    { name: 'Sun', patients: 15, revenue: 110000 },
]

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm shadow-slate-200/50 dark:shadow-none"
    >
        <div className="flex justify-between items-start">
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {change}
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
    </motion.div>
)

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/reports/dashboard')
                setStats(response.data.data)
            } catch (error) {
                console.error('Failed to fetch stats', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor hospital performance and patient metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Plus className="w-4 h-4 mr-2" /> New Patient
                    </button>
                    <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats?.total_patients || '1,284'}
                    change="+12.5%"
                    icon={Users}
                    trend="up"
                />
                <StatCard
                    title="Active Appointments"
                    value={stats?.active_appointments || '42'}
                    change="+8.1%"
                    icon={Calendar}
                    trend="up"
                />
                <StatCard
                    title="Revenue Today"
                    value={formatKES(stats?.revenue_today || 2450.00)}
                    change="-3.2%"
                    icon={CreditCard}
                    trend="down"
                />
                <StatCard
                    title="Staff Online"
                    value={stats?.online_staff || '18'}
                    change="+2"
                    icon={Activity}
                    trend="up"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Analysis</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly hospital income overview</p>
                        </div>
                        <select className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 focus:ring-0">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                    dataKey="revenue"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Patient Activity */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Patient Admission</h3>
                    <div className="flex-1 space-y-5">
                        {[
                            { name: 'John Doe', time: '10:30 AM', type: 'Checkup', color: 'bg-blue-500' },
                            { name: 'Sarah Wilson', time: '11:15 AM', type: 'Laboratory', color: 'bg-amber-500' },
                            { name: 'David Smith', time: '12:00 PM', type: 'Emergency', color: 'bg-red-500' },
                            { name: 'Emma Brown', time: '01:30 PM', type: 'Follow-up', color: 'bg-emerald-500' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} mr-4`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> {item.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 w-full py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200 dark:shadow-none">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold">Quick Services</h2>
                        <p className="text-indigo-100 mt-1 max-w-md">Access common medical tasks instantly from the dashboard.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold transition-all">
                            <UserPlus className="w-5 h-5 mr-3" /> Admit Patient
                        </button>
                        <button className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold transition-all">
                            <FileCheck className="w-5 h-5 mr-3" /> Lab Result
                        </button>
                        <button className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold transition-all">
                            <CreditCard className="w-5 h-5 mr-3" /> Process Bill
                        </button>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}

export default Dashboard
