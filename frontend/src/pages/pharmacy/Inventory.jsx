import React, { useState, useEffect } from 'react';
import {
    Package, Search, Plus, AlertTriangle,
    Filter, MoreVertical, RefreshCw, Truck
} from 'lucide-react';
import pharmacyService from '../../services/pharmacyService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { formatKES } from '../../utils/format';

const Inventory = () => {
    const [drugs, setDrugs] = useState([]);
    const [alerts, setAlerts] = useState({ low_stock: [], expiring_soon: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInventory();
        fetchAlerts();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await pharmacyService.getDrugs({ search: searchTerm });
            setDrugs(data.data || []);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const data = await pharmacyService.getAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInventory();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pharmacy Inventory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage drug stocks, batches, and reorder levels</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                        <Plus className="w-4 h-4 mr-2" /> Add Drug
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-100 dark:shadow-none">
                        <Truck className="w-4 h-4 mr-2" /> Receive Stock
                    </button>
                </div>
            </div>

            {/* Alerts Section */}
            {(alerts.low_stock.length > 0 || alerts.expiring_soon.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alerts.low_stock.length > 0 && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 rounded-2xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <div>
                                <h3 className="font-bold text-rose-700 dark:text-rose-300">Low Stock Alert</h3>
                                <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                                    {alerts.low_stock.length} items are below their reorder level.
                                </p>
                            </div>
                        </div>
                    )}
                    {alerts.expiring_soon.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-700 dark:text-amber-300">Expiring Soon</h3>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    {alerts.expiring_soon.length} batches are expiring within 3 months.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by generic or brand name..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                    />
                </form>
                <button
                    onClick={fetchInventory}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Drug Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Level</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/20"></td>
                                    </tr>
                                ))
                            ) : drugs.length > 0 ? (
                                drugs.map((drug) => (
                                    <tr key={drug.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{drug.brand_name || drug.generic_name}</p>
                                                <p className="text-xs text-slate-500">{drug.generic_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {drug.category || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <span className={`font-bold ${(drug.batches?.reduce((sum, b) => sum + b.quantity_remaining, 0) || 0) <= drug.reorder_level
                                                    ? 'text-rose-600'
                                                    : 'text-emerald-600'
                                                    }`}>
                                                    {drug.batches?.reduce((sum, b) => sum + b.quantity_remaining, 0) || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-900 dark:text-white">
                                            {formatKES(drug.unit_price)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                        No drugs found in inventory.
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

export default Inventory;
