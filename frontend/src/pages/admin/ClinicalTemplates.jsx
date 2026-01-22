import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    FileText,
    Check,
    X,
    Loader2,
    Filter,
    ClipboardList
} from 'lucide-react';
import { fetchClinicalTemplates } from '../../store/slices/clinicalSlice';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ClinicalTemplates = () => {
    const dispatch = useDispatch();
    const { templates = [], loading = false } = useSelector(state => state.clinical || {});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        type: 'complaint',
        label: '',
        content: '',
        is_active: true
    });

    useEffect(() => {
        dispatch(fetchClinicalTemplates());
    }, [dispatch]);

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setForm({
                type: template.type,
                label: template.label,
                content: template.content,
                is_active: template.is_active
            });
        } else {
            setEditingTemplate(null);
            setForm({
                type: 'complaint',
                label: '',
                content: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingTemplate) {
                await api.put(`/clinical/templates/${editingTemplate.id}`, form);
                toast.success('Template updated successfully');
            } else {
                await api.post('/clinical/templates', form);
                toast.success('Template created successfully');
            }
            dispatch(fetchClinicalTemplates());
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.delete(`/clinical/templates/${id}`);
            toast.success('Template deleted');
            dispatch(fetchClinicalTemplates());
        } catch (err) {
            toast.error('Failed to delete template');
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const categories = [
        { id: 'complaint', label: 'Chief Complaints', color: 'blue' },
        { id: 'finding', label: 'Examination Findings', color: 'purple' },
        { id: 'diagnosis', label: 'Diagnoses', color: 'emerald' },
        { id: 'plan', label: 'Treatment Plans', color: 'amber' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clinical Templates</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage shorthand clinical notes for faster encounter completion</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none appearance-none dark:text-white"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredTemplates.map((template) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-${categories.find(c => c.id === template.type)?.color}-50 dark:bg-${categories.find(c => c.id === template.type)?.color}-900/20 text-${categories.find(c => c.id === template.type)?.color}-600 dark:text-${categories.find(c => c.id === template.type)?.color}-400`}>
                                    {template.type}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(template)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{template.label}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 italic">"{template.content}"</p>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && filteredTemplates.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No clinical templates found.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {editingTemplate ? 'Edit Template' : 'New Clinical Template'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Category</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, type: cat.id })}
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${form.type === cat.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Template Label</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.label}
                                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                                            placeholder="e.g. Normal Cardiac Examination"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Template Content</label>
                                        <textarea
                                            required
                                            rows="5"
                                            value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            placeholder="The text that will be inserted into the clinical notes..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active template (Available for doctors)</label>
                                    </div>

                                    <button
                                        disabled={saving}
                                        type="submit"
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                        {editingTemplate ? 'Update Template' : 'Create Template'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClinicalTemplates;
