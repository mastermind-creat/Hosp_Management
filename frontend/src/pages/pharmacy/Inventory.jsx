import React, { useState, useEffect } from 'react';
import {
    Package, Search, Plus, AlertTriangle,
    Filter, MoreVertical, RefreshCw, Truck,
    X, Check, Loader2, Calendar, DollarSign
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
    const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [saving, setSaving] = useState(false);

    const [drugForm, setDrugForm] = useState({
        generic_name: '',
        brand_name: '',
        strength: '',
        form: 'tablet',
        category: '',
        unit_price: '',
        reorder_level: 50
    });

    const [stockForm, setStockForm] = useState({
        drug_id: '',
        batch_number: '',
        quantity: '',
        unit_cost: '',
        expiry_date: '',
        supplier_id: ''
    });

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

    const fetchSuppliers = async () => {
        try {
            const data = await pharmacyService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to load suppliers');
        }
    };

    const handleAddDrug = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await pharmacyService.createDrug(drugForm);
            toast.success('Drug added successfully');
            setIsAddDrugModalOpen(false);
            fetchInventory();
        } catch (error) {
            toast.error('Failed to add drug');
        } finally {
            setSaving(false);
        }
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await pharmacyService.addStock(stockForm.drug_id, stockForm);
            toast.success('Stock added successfully');
            setIsAddStockModalOpen(false);
            fetchInventory();
            fetchAlerts();
        } catch (error) {
            toast.error('Failed to add stock');
        } finally {
            setSaving(false);
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
                    <button
                        onClick={() => {
                            setDrugForm({ generic_name: '', brand_name: '', strength: '', form: 'tablet', category: '', unit_price: '', reorder_level: 50 });
                            setIsAddDrugModalOpen(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Drug
                    </button>
                    <button
                        onClick={() => {
                            setStockForm({ drug_id: '', batch_number: '', quantity: '', unit_cost: '', expiry_date: '', supplier_id: '' });
                            fetchSuppliers();
                            setIsAddStockModalOpen(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                    >
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

            {/* Add Drug Modal */}
            {isAddDrugModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-xl font-bold dark:text-white">Add New Drug</h1>
                                <button onClick={() => setIsAddDrugModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleAddDrug} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Generic Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={drugForm.generic_name}
                                            onChange={(e) => setDrugForm({ ...drugForm, generic_name: e.target.value })}
                                            placeholder="e.g. Paracetamol"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Brand Name</label>
                                        <input
                                            type="text"
                                            value={drugForm.brand_name}
                                            onChange={(e) => setDrugForm({ ...drugForm, brand_name: e.target.value })}
                                            placeholder="e.g. Panadol"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Strength</label>
                                        <input
                                            type="text"
                                            value={drugForm.strength}
                                            onChange={(e) => setDrugForm({ ...drugForm, strength: e.target.value })}
                                            placeholder="e.g. 500mg"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Form</label>
                                        <select
                                            value={drugForm.form}
                                            onChange={(e) => setDrugForm({ ...drugForm, form: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                        >
                                            <option value="tablet">Tablet</option>
                                            <option value="syrup">Syrup</option>
                                            <option value="injection">Injection</option>
                                            <option value="capsule">Capsule</option>
                                            <option value="ointment">Ointment</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Category</label>
                                        <input
                                            type="text"
                                            value={drugForm.category}
                                            onChange={(e) => setDrugForm({ ...drugForm, category: e.target.value })}
                                            placeholder="e.g. Analgesic"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Unit Selling Price</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                value={drugForm.unit_price}
                                                onChange={(e) => setDrugForm({ ...drugForm, unit_price: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Reorder Level</label>
                                    <input
                                        type="number"
                                        value={drugForm.reorder_level}
                                        onChange={(e) => setDrugForm({ ...drugForm, reorder_level: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                    Create Drug
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Receive Stock Modal */}
            {isAddStockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-xl font-bold dark:text-white">Receive Stock</h1>
                                <button onClick={() => setIsAddStockModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleAddStock} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Select Drug</label>
                                    <select
                                        required
                                        value={stockForm.drug_id}
                                        onChange={(e) => setStockForm({ ...stockForm, drug_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                    >
                                        <option value="">-- Search \ Select Drug --</option>
                                        {drugs.map(drug => (
                                            <option key={drug.id} value={drug.id}>
                                                {drug.brand_name ? `${drug.brand_name} (${drug.generic_name})` : drug.generic_name} - {drug.strength}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Batch Number</label>
                                        <input
                                            required
                                            type="text"
                                            value={stockForm.batch_number}
                                            onChange={(e) => setStockForm({ ...stockForm, batch_number: e.target.value })}
                                            placeholder="e.g. BN-2024-001"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Quantity</label>
                                        <input
                                            required
                                            type="number"
                                            value={stockForm.quantity}
                                            onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Unit Cost Price</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                value={stockForm.unit_cost}
                                                onChange={(e) => setStockForm({ ...stockForm, unit_cost: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Expiry Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type="date"
                                                value={stockForm.expiry_date}
                                                onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Supplier</label>
                                    <select
                                        value={stockForm.supplier_id}
                                        onChange={(e) => setStockForm({ ...stockForm, supplier_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                    >
                                        <option value="">-- Select Supplier --</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                    Receive Stock
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
