import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Building2, TrendingUp,
    FileText, CheckCircle2, XCircle, AlertCircle,
    Download, Filter, Search
} from 'lucide-react';
import api from '../../services/api';
import { formatKES } from '../../utils/format';

const InsuranceDashboard = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/insurance/providers');
            setProviders(response.data);
        } catch (error) {
            console.error('Failed to load insurance metadata');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        Insurance & Schemes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage health providers, SHIF/SHA claims and policy coverage</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <FileText className="w-4 h-4 mr-2" /> Bulk Claims
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                        <Building2 className="w-4 h-4 mr-2" /> Add Provider
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Pending Claims"
                    value={formatKES(1245000)}
                    icon={AlertCircle}
                    color="amber"
                    subtitle="24 claims awaiting approval"
                />
                <StatCard
                    title="Reimbursed (MTD)"
                    value={formatKES(4850600)}
                    icon={CheckCircle2}
                    color="emerald"
                    subtitle="+12% from last month"
                />
                <StatCard
                    title="Active Policies"
                    value="1,248"
                    icon={ShieldCheck}
                    color="indigo"
                    subtitle="Across 12 providers"
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Insurance Providers</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search provider..."
                                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provider Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Patients</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'SHIF / SHA Kenya', type: 'Public', patients: 845, amount: 845000 },
                                { name: 'Jubilee Insurance', type: 'Private', patients: 124, amount: 320000 },
                                { name: 'AAR Health', type: 'Private', patients: 86, amount: 154000 },
                                { name: 'Old Mutual', type: 'Private', patients: 42, amount: 98000 },
                            ].map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                                {p.name.charAt(0)}
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${p.type === 'Public' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                        {p.patients} Patients
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                        {formatKES(p.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colors = {
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <trending-up className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{value}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
    );
};

export default InsuranceDashboard;
