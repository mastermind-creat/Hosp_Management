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
    const [activeView, setActiveView] = useState('inventory'); // 'inventory' | 'suppliers'

    // Drug States
    const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [selectedDrug, setSelectedDrug] = useState(null); // For batch details

    // Stock/Batch States
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

    // Supplier States
    const [suppliers, setSuppliers] = useState([]);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

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

    const [supplierForm, setSupplierForm] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
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
            const data = await pharmacyService.getInventoryAlerts();
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
            if (editingDrug) {
                await pharmacyService.updateDrug(editingDrug.id, drugForm);
                toast.success('Drug updated successfully');
            } else {
                await pharmacyService.createDrug(drugForm);
                toast.success('Drug added successfully');
            }
            setIsAddDrugModalOpen(false);
            setEditingDrug(null);
            fetchInventory();
        } catch (error) {
            toast.error(editingDrug ? 'Failed to update drug' : 'Failed to add drug');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDrug = async (id) => {
        if (!window.confirm('Are you sure you want to delete this drug?')) return;
        try {
            await pharmacyService.deleteDrug(id);
            toast.success('Drug deleted successfully');
            fetchInventory();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete drug');
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

    const handleSupplierSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingSupplier) {
                await pharmacyService.updateSupplier(editingSupplier.id, supplierForm);
                toast.success('Supplier updated');
            } else {
                await pharmacyService.createSupplier(supplierForm);
                toast.success('Supplier added');
            }
            setIsSupplierModalOpen(false);
            setEditingSupplier(null);
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to save supplier');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSupplier = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await pharmacyService.deleteSupplier(id);
            toast.success('Supplier deleted');
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier');
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
                            setEditingDrug(null);
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
            {activeView === 'inventory' && (alerts.low_stock.length > 0 || alerts.expiring_soon.length > 0) && (
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

            {/* Search & Tabs */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveView('inventory')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'inventory' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => {
                            setActiveView('suppliers');
                            fetchSuppliers();
                        }}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'suppliers' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                        Suppliers
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 flex flex-col md:flex-row gap-4 flex-1">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={activeView === 'inventory' ? "Search drugs..." : "Search suppliers..."}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm dark:text-white"
                        />
                    </form>
                    <button
                        onClick={activeView === 'inventory' ? fetchInventory : fetchSuppliers}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {activeView === 'suppliers' && (
                        <button
                            onClick={() => {
                                setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
                                setEditingSupplier(null);
                                setIsSupplierModalOpen(true);
                            }}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Supplier
                        </button>
                    )}
                </div>
            </div>

            {/* Inventory Table */}
            {activeView === 'inventory' && (
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
                                                <button
                                                    onClick={() => setSelectedDrug(drug)}
                                                    className="text-left hover:text-indigo-600 transition-colors group"
                                                >
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">{drug.brand_name || drug.generic_name}</p>
                                                    <p className="text-xs text-slate-500">{drug.generic_name} {drug.strength && `• ${drug.strength}`}</p>
                                                </button>
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingDrug(drug);
                                                            setDrugForm({
                                                                generic_name: drug.generic_name,
                                                                brand_name: drug.brand_name || '',
                                                                strength: drug.strength || '',
                                                                form: drug.form || 'tablet',
                                                                category: drug.category || '',
                                                                unit_price: drug.unit_price,
                                                                reorder_level: drug.reorder_level || 50
                                                            });
                                                            setIsAddDrugModalOpen(true);
                                                        }}
                                                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors"
                                                    >
                                                        EDIT
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDrug(drug.id)}
                                                        className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/40 px-2 py-1 rounded-md hover:bg-rose-100 transition-colors"
                                                    >
                                                        DELETE
                                                    </button>
                                                </div>
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
            )}

            {/* Suppliers View */}
            {activeView === 'suppliers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]"></div>
                        ))
                    ) : suppliers.length > 0 ? (
                        suppliers.map(supplier => (
                            <div key={supplier.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingSupplier(supplier);
                                                setSupplierForm({
                                                    name: supplier.name,
                                                    contact_person: supplier.contact_person || '',
                                                    phone: supplier.phone || '',
                                                    email: supplier.email || '',
                                                    address: supplier.address || ''
                                                });
                                                setIsSupplierModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                        >
                                            <Plus className="w-4 h-4 rotate-45 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSupplier(supplier.id)}
                                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                        >
                                            <X className="w-4 h-4 text-rose-400" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg dark:text-white mb-1 uppercase tracking-tight">{supplier.name}</h3>
                                <p className="text-sm text-slate-500 mb-4">{supplier.contact_person || 'No contact person'}</p>
                                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    {supplier.phone && (
                                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                            <Plus className="w-3 h-3 mr-2 text-indigo-500" /> {supplier.phone}
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                            <Search className="w-3 h-3 mr-2 rotate-90 text-indigo-500" /> {supplier.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-500 italic">
                            No suppliers found.
                        </div>
                    )}
                </div>
            )}

            {/* Drug Details Modal */}
            {selectedDrug && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-xl font-bold dark:text-white">{selectedDrug.brand_name || selectedDrug.generic_name}</h1>
                                    <p className="text-sm text-slate-500">{selectedDrug.generic_name}</p>
                                </div>
                                <button onClick={() => setSelectedDrug(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Stock</p>
                                        <p className="text-2xl font-bold dark:text-white">{selectedDrug.batches?.reduce((sum, b) => sum + b.quantity_remaining, 0) || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Selling Price</p>
                                        <p className="text-2xl font-bold text-emerald-600">{formatKES(selectedDrug.unit_price)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Reorder Level</p>
                                        <p className="text-2xl font-bold text-rose-600">{selectedDrug.reorder_level}</p>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-4 py-3 text-slate-500">Batch #</th>
                                                <th className="px-4 py-3 text-slate-500">Remaining</th>
                                                <th className="px-4 py-3 text-slate-500">Expiry</th>
                                                <th className="px-4 py-3 text-slate-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                                            {selectedDrug.batches?.map(batch => (
                                                <tr key={batch.id}>
                                                    <td className="px-4 py-3 font-mono">{batch.batch_number}</td>
                                                    <td className="px-4 py-3 font-bold">{batch.quantity_remaining}</td>
                                                    <td className="px-4 py-3">{format(new Date(batch.expiry_date), 'MMM dd, yyyy')}</td>
                                                    <td className="px-4 py-3">
                                                        {new Date(batch.expiry_date) < new Date() ? (
                                                            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold">EXPIRED</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold">ACTIVE</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Supplier Modal */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-xl font-bold dark:text-white">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h1>
                                <button onClick={() => setIsSupplierModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSupplierSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Supplier Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={supplierForm.name}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contact Person</label>
                                        <input
                                            type="text"
                                            value={supplierForm.contact_person}
                                            onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label>
                                        <input
                                            type="text"
                                            value={supplierForm.phone}
                                            onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={supplierForm.email}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Address</label>
                                    <textarea
                                        value={supplierForm.address}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                        rows="2"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                    {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Drug Modal */}
            {isAddDrugModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-xl font-bold dark:text-white">{editingDrug ? 'Edit Drug' : 'Add New Drug'}</h1>
                                <button onClick={() => { setIsAddDrugModalOpen(false); setEditingDrug(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
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
                                            placeholder="e.g. Antibiotic"
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
                                    {editingDrug ? 'Update Drug' : 'Create Drug'}
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
