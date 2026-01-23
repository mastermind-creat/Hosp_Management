import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search,
    Briefcase, Building2, Shield, MoreVertical,
    Filter, Download, ChevronRight, UserCheck, UserX, Trash2, Edit2
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); // Default to all

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStaff();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchTerm, filterDept, filterRole, filterStatus]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [deptsRes, rolesRes] = await Promise.all([
                api.get('/departments'),
                api.get('/roles')
            ]);
            setDepartments(deptsRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error('Failed to load metadata');
        }
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await api.get('/staff', {
                params: {
                    department_id: filterDept,
                    role_id: filterRole,
                    status: filterStatus,
                    search: searchTerm
                }
            });
            setStaff(res.data);
        } catch (error) {
            toast.error('Failed to load staff records');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            suspended: 'bg-amber-50 text-amber-700 border-amber-100',
            exited: 'bg-rose-50 text-rose-700 border-rose-100',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const handleToggleStatus = async (s) => {
        const newStatus = s.employment_status === 'active' ? 'suspended' : 'active';
        try {
            await api.put(`/staff/${s.id}`, { employment_status: newStatus });
            toast.success(`Staff status updated to ${newStatus}`);
            fetchStaff();
        } catch (error) {
            toast.error('Failed to update staff status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff record? This will also deactivate the user account.')) return;
        try {
            await api.delete(`/staff/${id}`);
            toast.success('Staff record deleted successfully');
            fetchStaff();
        } catch (error) {
            toast.error('Failed to delete staff record');
        }
    };

    // Data is now filtered on the backend
    const filteredStaff = staff;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Staff Directory
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage hospital HR records and designations</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                    <Link to="/staff/structure" className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
                        <Building2 className="w-4 h-4 mr-2" /> Configure Structure
                    </Link>
                    <Link to="/staff/new" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                        <UserPlus className="w-4 h-4 mr-2" /> Register Staff
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, ID or email..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <option value="all">All Roles</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.display_name}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Status: Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="exited">Exited</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/20"></td>
                                    </tr>
                                ))
                            ) : filteredStaff.length > 0 ? (
                                filteredStaff.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                                    {s.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{s.user.name}</p>
                                                    <p className="text-xs text-slate-500 tracking-wider font-mono">{s.employee_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Building2 className="w-4 h-4 opacity-50" />
                                                <span className="text-sm">{s.department?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {s.designation?.name || 'Not Set'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.user?.roles?.[0] ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    {s.user.roles[0].display_name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">No Role</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500">{new Date(s.date_joined).toLocaleDateString()}</p>
                                            {getStatusBadge(s.employment_status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleStatus(s)}
                                                    className={`p-2 rounded-lg transition-colors ${s.employment_status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                                    title={s.employment_status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                                >
                                                    {s.employment_status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                                <Link
                                                    to={`/staff/edit/${s.id}`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Staff"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Staff"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                                        No staff records found.
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

export default StaffList;
