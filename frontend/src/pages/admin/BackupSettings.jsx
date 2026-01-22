import React, { useState, useEffect } from 'react';
import {
    Download, RefreshCw, Trash2, Database,
    Shield, Clock, FileArchive, CheckCircle, Upload, Settings
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import DeviceInfo from '../../components/admin/DeviceInfo';

const BackupSettings = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/backups');
            setBackups(response.data.backups);
        } catch (error) {
            toast.error('Failed to load backups');
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        try {
            setCreating(true);
            await api.post('/backups');
            toast.success('Backup created successfully');
            fetchBackups();
        } catch (error) {
            toast.error('Failed to create backup');
        } finally {
            setCreating(false);
        }
    };

    const deleteBackup = async (filename) => {
        if (!confirm('Are you sure you want to delete this backup?')) return;

        try {
            await api.delete(`/backups/${filename}`);
            toast.success('Backup deleted');
            setBackups(prev => prev.filter(b => b.name !== filename));
        } catch (error) {
            toast.error('Failed to delete backup');
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        System Tools
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage device identity, backups, and system health.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchBackups}
                        className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={createBackup}
                        disabled={creating}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {creating ? (
                            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                        ) : (
                            <><Database className="w-4 h-4 mr-2" /> Create New Backup</>
                        )}
                    </button>
                </div>
            </div>

            {/* Device Info */}
            <DeviceInfo />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="font-medium text-indigo-100">Last Backup</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {backups.length > 0
                                    ? new Date(backups[0].timestamp * 1000).toLocaleDateString()
                                    : 'Never'}
                            </h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm font-medium text-indigo-100">
                        <div className="flex items-center gap-2">
                            <FileArchive className="w-4 h-4" />
                            {backups.length} Archives
                        </div>
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            {backups.reduce((acc, curr) => acc + curr.size, 0) / 1024 / 1024 > 0
                                ? formatBytes(backups.reduce((acc, curr) => acc + curr.size, 0))
                                : '0 KB'}
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Backup Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600">
                                <Database className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">SQLite Database</p>
                                <p className="text-xs text-slate-500">Backups contain the full `database.sqlite` file, including all patient records and configuration.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Retention Policy</p>
                                <p className="text-xs text-slate-500">Manual backups are kept indefinitely. Please download important backups to external storage.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backups List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Backup Archives</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {backups.length} Files found
                    </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {backups.length > 0 ? (
                        backups.map((backup) => (
                            <div key={backup.name} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <FileArchive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{backup.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(backup.timestamp * 1000).toLocaleString()}
                                            </span>
                                            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                                {formatBytes(backup.size)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => window.open(`${api.defaults.baseURL}/backups/${backup.name}`, '_blank')}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                        title="Download Backup"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteBackup(backup.name)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Delete Backup"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Database className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <p>No backups found</p>
                            <p className="text-sm mt-1">Create your first backup to secure your data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackupSettings;
