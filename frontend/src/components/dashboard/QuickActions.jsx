import React from 'react';
import {
    UserPlus, Calendar, Activity,
    CreditCard, FileText, FlaskConical,
    Pill, LayoutDashboard, History
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = ({ role }) => {
    const actionsByRole = {
        admin: [
            { label: 'Register Patient', icon: UserPlus, path: '/patients/new', color: 'text-blue-600 bg-blue-50' },
            { label: 'Book Appointment', icon: Calendar, path: '/appointments', color: 'text-indigo-600 bg-indigo-50' },
            { label: 'System Logs', icon: FileText, path: '/admin/system-logs', color: 'text-slate-600 bg-slate-50' },
            { label: 'User Roles', icon: LayoutDashboard, path: '/admin/users', color: 'text-purple-600 bg-purple-50' },
        ],
        receptionist: [
            { label: 'Register Patient', icon: UserPlus, path: '/patients/new', color: 'text-blue-600 bg-blue-50' },
            { label: 'Book Appointment', icon: Calendar, path: '/appointments', color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Visit Queue', icon: History, path: '/clinical', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Search Records', icon: UserPlus, path: '/patients', color: 'text-orange-600 bg-orange-50' },
        ],
        accountant: [
            { label: 'Process Bill', icon: CreditCard, path: '/billing/new', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Payment History', icon: History, path: '/billing', color: 'text-blue-600 bg-blue-50' },
            { label: 'Daily Summary', icon: FileText, path: '/reports', color: 'text-purple-600 bg-purple-50' },
            { label: 'Patient Invoices', icon: FileText, path: '/billing', color: 'text-indigo-600 bg-indigo-50' },
        ],
        doctor: [
            { label: 'My Queue', icon: Activity, path: '/clinical', color: 'text-rose-600 bg-rose-50' },
            { label: 'Lab Requests', icon: FlaskConical, path: '/lab', color: 'text-blue-600 bg-blue-50' },
            { label: 'Prescriptions', icon: Pill, path: '/pharmacy', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Medical History', icon: History, path: '/patients', color: 'text-indigo-600 bg-indigo-50' },
        ],
        pharmacist: [
            { label: 'Dispense Meds', icon: Pill, path: '/pharmacy', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Inventory Management', icon: LayoutDashboard, path: '/pharmacy', color: 'text-blue-600 bg-blue-50' },
            { label: 'Stock Alerts', icon: Activity, path: '/pharmacy', color: 'text-rose-600 bg-rose-50' },
            { label: 'Prescription Queue', icon: History, path: '/clinical', color: 'text-indigo-600 bg-indigo-50' },
        ],
        lab_tech: [
            { label: 'Lab Requests', icon: FlaskConical, path: '/lab', color: 'text-blue-600 bg-blue-50' },
            { label: 'Enter Results', icon: FileText, path: '/lab', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Test Catalog', icon: LayoutDashboard, path: '/lab', color: 'text-purple-600 bg-purple-50' },
            { label: 'Recent Tests', icon: History, path: '/lab', color: 'text-indigo-600 bg-indigo-50' },
        ],
    };

    const currentActions = actionsByRole[role] || actionsByRole.admin;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
                {currentActions.map((action, idx) => (
                    <Link
                        key={idx}
                        to={action.path}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all group group"
                    >
                        <div className={`p-2 rounded-lg mb-2 ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
