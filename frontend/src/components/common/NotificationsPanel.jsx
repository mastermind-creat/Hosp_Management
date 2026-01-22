import React from 'react';
import { Bell, AlertTriangle, Pill, Database, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPanel = ({ alerts, onClose }) => {
    if (!alerts) return null;

    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <button onClick={onClose} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Mark all read
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {alerts.counts === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6" />
                        </div>
                        <p className="text-sm">All systems operational</p>
                    </div>
                )}

                {alerts.backup?.status !== 'ok' && (
                    <Link to="/admin/backups" className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/50">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                <Database className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Backup overdue</p>
                                <p className="text-xs text-slate-500 mt-1">System backup not performed in 24h.</p>
                            </div>
                        </div>
                    </Link>
                )}

                {alerts.stock > 0 && (
                    <Link to="/pharmacy" className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/50">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                                <Pill className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Low Stock Alert</p>
                                <p className="text-xs text-slate-500 mt-1">{alerts.stock} items are below reorder level.</p>
                            </div>
                        </div>
                    </Link>
                )}

                {alerts.lab > 0 && (
                    <Link to="/lab" className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Pending Lab Results</p>
                                <p className="text-xs text-slate-500 mt-1">{alerts.lab} tests waiting for results.</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
