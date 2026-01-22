import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Lock,
    Building2, Briefcase, Calendar,
    CheckCircle, ArrowLeft, Save,
    AlertCircle, Settings, Info
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const StaffForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        employee_id: '', // Optional - will be auto-generated if empty
        department_id: '',
        designation_id: '',
        role_id: '',
        date_joined: new Date().toISOString().split('T')[0],
        employment_status: 'active'
    });

    const { id } = useParams();
    const isEdit = !!id;

    useEffect(() => {
        fetchMetadata();
        if (isEdit) {
            fetchStaffData();
        }
    }, [id]);

    const fetchStaffData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/staff/${id}`);
            const s = response.data;
            setFormData({
                name: s.user.name,
                email: s.user.email,
                password: '', // Keep empty unless changing
                employee_id: s.employee_id,
                department_id: s.department_id,
                designation_id: s.designation_id,
                role_id: s.user.roles?.[0]?.id || '',
                date_joined: s.date_joined ? s.date_joined.split('T')[0] : '',
                employment_status: s.employment_status
            });
        } catch (error) {
            toast.error('Failed to load staff details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [depts, desigs, rolesRes] = await Promise.all([
                api.get('/departments'),
                api.get('/designations'),
                api.get('/roles')
            ]);
            setDepartments(depts.data);
            setDesignations(desigs.data);
            setRoles(rolesRes.data);
        } catch (error) {
            toast.error('Failed to load form data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEdit) {
                // For update, password might be empty
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/staff/${id}`, updateData);
                toast.success('Staff member updated successfully');
            } else {
                await api.post('/staff', formData);
                toast.success('Staff member registered successfully');
            }
            navigate('/staff');
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'register'} staff`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Directory
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Staff Member' : 'Staff Registration'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isEdit ? 'Update the information for this staff member.' : 'Complete the form below to add a new hospital employee.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Dr. John Doe"
                                required
                            />
                            <InputField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john.doe@hospital.com"
                                required
                            />
                            <InputField
                                label={isEdit ? "Login Password (Leave blank to keep current)" : "Login Password"}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isEdit ? "••••••••" : "Minimum 8 characters"}
                                required={!isEdit}
                            />
                            <InputField
                                label="Employee ID (Optional)"
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                                placeholder="Leave empty to auto-generate (e.g., EMP-2026-002)"
                            />
                        </div>
                    </section>

                    {/* Hospital Assignment */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Professional Assignment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField
                                label="Department"
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                options={departments}
                                setupLink="/staff/structure"
                                setupLabel="Configure Departments"
                                required
                            />
                            <SelectField
                                label="Designation (Job Title)"
                                name="designation_id"
                                value={formData.designation_id}
                                onChange={handleChange}
                                options={designations}
                                setupLink="/staff/structure"
                                setupLabel="Configure Job Roles"
                                tooltip="Official job title (e.g., Senior Nurse, Chief Pharmacist)"
                                required
                            />
                            <SelectField
                                label="System Role (Permissions)"
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleChange}
                                options={roles}
                                isRoles={true}
                                tooltip="Controls system access and permissions (e.g., Doctor, Pharmacist)"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Date Joined"
                                name="date_joined"
                                type="date"
                                value={formData.date_joined}
                                onChange={handleChange}
                                required
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Employment Status
                                </label>
                                <select
                                    name="employment_status"
                                    value={formData.employment_status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="exited">Exited</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50"
                        >
                            {loading ? 'Registering...' : (
                                <><Save className="w-5 h-5 mr-2" /> Complete Registration</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
    </div>
);

const SelectField = ({ label, options, isRoles, setupLink, setupLabel, tooltip, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            {label}
            {tooltip && (
                <div className="group relative">
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl">
                        {tooltip}
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                    </div>
                </div>
            )}
        </label>
        <select
            {...props}
            className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${options.length === 0 ? 'border-amber-200 bg-amber-50/30' : ''}`}
        >
            <option value="">Select {label}</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>
                    {isRoles ? opt.display_name : opt.name}
                </option>
            ))}
        </select>
        {options.length === 0 && setupLink && (
            <Link
                to={setupLink}
                className="flex items-center text-[10px] font-bold text-amber-600 hover:text-amber-700 mt-1 uppercase"
            >
                <AlertCircle className="w-3 h-3 mr-1" /> {setupLabel} Required
            </Link>
        )}
    </div>
);

export default StaffForm;
