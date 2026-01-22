import React, { useState, useEffect } from 'react';
import {
    Building2, Briefcase, Plus, Save,
    Trash2, Edit2, X, CheckCircle, Search,
    Loader2, Users, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const DepartmentSetup = () => {
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editing states
    const [editingDept, setEditingDept] = useState(null);
    const [editingDesig, setEditingDesig] = useState(null);

    const [deptForm, setDeptForm] = useState({ name: '', description: '' });
    const [desigForm, setDesigForm] = useState({ name: '', description: '' });

    // Search states
    const [deptSearch, setDeptSearch] = useState('');
    const [desigSearch, setDesigSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [depts, desigs] = await Promise.all([
                api.get('/departments'),
                api.get('/designations')
            ]);
            setDepartments(depts.data);
            setDesignations(desigs.data);
        } catch (error) {
            toast.error('Failed to load metadata');
        } finally {
            setLoading(false);
        }
    };

    const handleDeptSubmit = async (e) => {
        e.preventDefault();
        if (!deptForm.name) return;
        setSaving(true);
        try {
            if (editingDept) {
                const res = await api.put(`/departments/${editingDept.id}`, deptForm);
                setDepartments(departments.map(d => d.id === editingDept.id ? { ...d, ...res.data } : d));
                toast.success('Department updated');
            } else {
                const res = await api.post('/departments', deptForm);
                setDepartments([...departments, res.data]);
                toast.success('Department added');
            }
            setDeptForm({ name: '', description: '' });
            setEditingDept(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving department');
        } finally {
            setSaving(false);
        }
    };

    const handleDesigSubmit = async (e) => {
        e.preventDefault();
        if (!desigForm.name) return;
        setSaving(true);
        try {
            if (editingDesig) {
                const res = await api.put(`/designations/${editingDesig.id}`, desigForm);
                setDesignations(designations.map(d => d.id === editingDesig.id ? { ...d, ...res.data } : d));
                toast.success('Designation updated');
            } else {
                const res = await api.post('/designations', desigForm);
                setDesignations([...designations, res.data]);
                toast.success('Designation added');
            }
            setDesigForm({ name: '', description: '' });
            setEditingDesig(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving designation');
        } finally {
            setSaving(false);
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type === 'departments' ? 'department' : 'designation'}?`)) return;
        try {
            await api.delete(`/${type}/${id}`);
            if (type === 'departments') setDepartments(departments.filter(d => d.id !== id));
            else setDesignations(designations.filter(d => d.id !== id));
            toast.success('Record deleted');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Delete failed');
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(deptSearch.toLowerCase())
    );

    const filteredDesigs = designations.filter(d =>
        d.name.toLowerCase().includes(desigSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        Hospital Structure
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure your hospital's organizational hierarchy and job roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Departments Section */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                Departments
                            </h2>
                            {editingDept && (
                                <button
                                    onClick={() => { setEditingDept(null); setDeptForm({ name: '', description: '' }); }}
                                    className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> CANCEL EDIT
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleDeptSubmit} className="space-y-4 mb-8">
                            <div className="flex gap-2">
                                <input
                                    required
                                    type="text"
                                    placeholder="Department Name (e.g. Pharmacy)"
                                    className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    value={deptForm.name}
                                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingDept ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                    {editingDept ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                className="w-full pl-10 pr-4 py-2 bg-transparent text-xs border-b border-slate-100 dark:border-slate-800 outline-none dark:text-slate-400"
                                value={deptSearch}
                                onChange={(e) => setDeptSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-16 animate-pulse bg-slate-50 dark:bg-slate-800/20 rounded-2xl"></div>
                                ))
                            ) : filteredDepts.length > 0 ? (
                                filteredDepts.map(dept => (
                                    <div key={dept.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{dept.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Users className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{dept.staff_count || 0} Staff Members</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingDept(dept); setDeptForm({ name: dept.name, description: dept.description || '' }); }}
                                                className="p-2 text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteItem('departments', dept.id)}
                                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-400 italic text-sm">No departments found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Designations Section */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                Designations
                            </h2>
                            {editingDesig && (
                                <button
                                    onClick={() => { setEditingDesig(null); setDesigForm({ name: '', description: '' }); }}
                                    className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> CANCEL EDIT
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleDesigSubmit} className="space-y-4 mb-8">
                            <div className="flex gap-2">
                                <input
                                    required
                                    type="text"
                                    placeholder="Designation (e.g. Senior Nurse)"
                                    className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    value={desigForm.name}
                                    onChange={(e) => setDesigForm({ ...desigForm, name: e.target.value })}
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-100 dark:shadow-none flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingDesig ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                    {editingDesig ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search designations..."
                                className="w-full pl-10 pr-4 py-2 bg-transparent text-xs border-b border-slate-100 dark:border-slate-800 outline-none dark:text-slate-400"
                                value={desigSearch}
                                onChange={(e) => setDesigSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-16 animate-pulse bg-slate-50 dark:bg-slate-800/20 rounded-2xl"></div>
                                ))
                            ) : filteredDesigs.length > 0 ? (
                                filteredDesigs.map(desig => (
                                    <div key={desig.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 transition-colors">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{desig.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Designation / Role</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingDesig(desig); setDesigForm({ name: desig.name, description: desig.description || '' }); }}
                                                className="p-2 text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteItem('designations', desig.id)}
                                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-400 italic text-sm">No designations found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Note Section */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-6 rounded-[2rem] flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-400">Important Note</h4>
                    <p className="text-sm text-amber-800/80 dark:text-amber-500/80 mt-1">
                        Departments and designations are core to staff registration. Ensure they are correctly spelled before assigning them to personnel.
                        Deleting a structure item is only possible if no staff members are currently assigned to it.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DepartmentSetup;
