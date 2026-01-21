import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, PieChart, Download,
    Calendar, Users, Activity, CreditCard, Filter
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart as RePieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';
import { formatKES } from '../../utils/format';

const ReportsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('today');

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/dashboard-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    const revenueData = [
        { name: 'Mon', amount: 45000 },
        { name: 'Tue', amount: 52000 },
        { name: 'Wed', amount: 48000 },
        { name: 'Thu', amount: 61000 },
        { name: 'Fri', amount: 55000 },
        { name: 'Sat', amount: 40000 },
        { name: 'Sun', amount: 35000 },
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        Reports & Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Hospital performance and financial insights</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="today">Today</option>
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="year">Past Year</option>
                    </select>
                    <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Export .PDF
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox
                    title="Total Patients"
                    value={stats?.patients_total || '0'}
                    icon={Users}
                    color="indigo"
                />
                <StatBox
                    title="Visits Today"
                    value={stats?.visits_today || '0'}
                    icon={Activity}
                    color="emerald"
                />
                <StatBox
                    title="Revenue Today"
                    value={formatKES(stats?.revenue_today || 0)}
                    icon={CreditCard}
                    color="amber"
                />
                <StatBox
                    title="Low Stock Items"
                    value={stats?.low_stock_drugs || '0'}
                    icon={TrendingUp}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-500" />
                            Revenue Trend
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatKES(value)}
                                />
                                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Patient Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" />
                            Departmental Load
                        </h3>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={[
                                        { name: 'OPD', value: 45 },
                                        { name: 'Pharmacy', value: 30 },
                                        { name: 'Laboratory', value: 15 },
                                        { name: 'Radiology', value: 10 },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[0, 1, 2, 3].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2 ml-4">
                            {['OPD', 'Pharmacy', 'Lab', 'Rad'].map((dept, i) => (
                                <div key={dept} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{dept}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};

export default ReportsDashboard;
