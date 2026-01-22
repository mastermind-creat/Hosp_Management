import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SyncStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sync/status');
            setStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch sync status');
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = async () => {
        try {
            setSyncing(true);
            const response = await api.post('/sync/trigger');
            if (response.data.status === 'completed') {
                toast.success(`Synced ${response.data.processed} items`);
            }
            fetchStatus();
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    if (!status) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-indigo-600" />
                    Cloud Sync
                </h3>
                <span className="text-xs font-mono text-slate-400">{status.terminal_id}</span>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500 mb-1">Pending Items</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {status.pending_count}
                    </div>
                </div>
                
                {status.failed_count > 0 && (
                    <div className="text-right">
                        <div className="text-sm text-red-500 mb-1 flex items-center justify-end gap-1">
                            <AlertCircle className="w-3 h-3" /> Failed
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            {status.failed_count}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    {status.last_sync ? (
                        <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Last: {new Date(status.last_sync.sync_completed_at).toLocaleTimeString()}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                            <CloudOff className="w-3 h-3" />
                            Never synced
                        </span>
                    )}
                </div>

                <button
                    onClick={triggerSync}
                    disabled={syncing || status.pending_count === 0}
                    className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default SyncStatus;
