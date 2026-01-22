import React, { useState, useEffect } from 'react';
import {
    ScrollText, RefreshCw, AlertTriangle, Info, AlertOctagon, Filter, Search
} from 'lucide-react';
import api from '../../services/api';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterLevel, setFilterLevel] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page, filterLevel]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/system-logs', {
                params: {
                    page,
                    level: filterLevel
                }
            });
            setLogs(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelBadge = (level) => {
        const styles = {
            ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
            INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            DEBUG: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        };
        const icons = {
            ERROR: <AlertOctagon className="w-3 h-3 mr-1" />,
            WARNING: <AlertTriangle className="w-3 h-3 mr-1" />,
            INFO: <Info className="w-3 h-3 mr-1" />,
            DEBUG: <Search className="w-3 h-3 mr-1" />
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[level] || styles.DEBUG}`}>
                {icons[level]}
                {level}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <ScrollText className="w-8 h-8 text-indigo-600" />
                        System Logs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">View and debug system events</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['', 'ERROR', 'WARNING', 'INFO'].map(level => (
                    <button
                        key={level}
                        onClick={() => { setFilterLevel(level); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filterLevel === level
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {level || 'All Levels'}
                    </button>
                ))}
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Timestamp</th>
                                <th className="px-6 py-3 font-medium">Level</th>
                                <th className="px-6 py-3 font-medium">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            {getLevelBadge(log.level)}
                                        </td>
                                        <td className="px-6 py-3 text-slate-900 dark:text-white font-mono text-xs break-all max-w-xl">
                                            {log.message}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        <ScrollText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                        <p>No logs found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-slate-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemLogs;
