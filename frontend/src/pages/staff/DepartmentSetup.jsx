import React, { useState, useEffect } from 'react';
import {
    Building2, Briefcase, Plus, Save,
    Trash2, Edit2, X, CheckSquare
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const DepartmentSetup = () => {
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newDesig, setNewDesig] = useState({ name: '', description: '' });

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

    const handleAddDept = async () => {
        if (!newDept.name) return;
        try {
            const res = await api.post('/departments', newDept);
            setDepartments([...departments, res.data]);
            setNewDept({ name: '', description: '' });
            toast.success('Department added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding department');
        }
    };

    const handleAddDesig = async () => {
        if (!newDesig.name) return;
        try {
            const res = await api.post('/designations', newDesig);
            setDesignations([...designations, res.data]);
            setNewDesig({ name: '', description: '' });
            toast.success('Designation added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding designation');
        }
    };

    const deleteItem = async (type, id) => {
        try {
            await api.delete(`/${type}/${id}`);
            if (type === 'departments') setDepartments(departments.filter(d => d.id !== id));
            else setDesignations(designations.filter(d => d.id !== id));
            toast.success('Record deleted');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Cannot delete item with active staff');
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-indigo-600" />
                    Hospital Structure
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Configure departments and job designations for staff</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Departments */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        Departments
                    </h2>

                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="e.g. Pharmacy, Radiology"
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newDept.name}
                            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                        />
                        <button
                            onClick={handleAddDept}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="h-20 animate-pulse bg-slate-50 dark:bg-slate-800/20 rounded-xl"></div>
                        ) : (
                            departments.map(dept => (
                                <div key={dept.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white py-1">{dept.name}</p>
                                        <p className="text-xs text-slate-500 px-1">{dept.staff_count || 0} Staff Members</p>
                                    </div>
                                    <button
                                        onClick={() => deleteItem('departments', dept.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Designations */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        Designations
                    </h2>

                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="e.g. Senior Doctor, Nurse In-charge"
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newDesig.name}
                            onChange={(e) => setNewDesig({ ...newDesig, name: e.target.value })}
                        />
                        <button
                            onClick={handleAddDesig}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="h-20 animate-pulse bg-slate-50 dark:bg-slate-800/20 rounded-xl"></div>
                        ) : (
                            designations.map(desig => (
                                <div key={desig.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <p className="font-semibold text-slate-900 dark:text-white py-1">{desig.name}</p>
                                    <button
                                        onClick={() => deleteItem('designations', desig.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentSetup;
