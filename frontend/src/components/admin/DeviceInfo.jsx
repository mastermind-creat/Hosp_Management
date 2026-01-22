import React, { useState, useEffect } from 'react';
import { Server, MapPin, Hash, Globe, Save } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const DeviceInfo = () => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [facilityId, setFacilityId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchIdentity();
    }, []);

    const fetchIdentity = async () => {
        try {
            const response = await api.get('/device/identity');
            setInfo(response.data);
            setFacilityId(response.data.facility_id || '');
        } catch (error) {
            console.error('Failed to fetch device identity');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            const response = await api.post('/device/facility', { facility_id: facilityId });
            setInfo(response.data);
            toast.success('Facility updated');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse bg-slate-100 h-48 rounded-2xl"></div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                Installation Identity
            </h3>

            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Terminal ID
                    </div>
                    <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                        {info?.terminal_id}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Facility ID Binding
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={facilityId}
                            onChange={(e) => setFacilityId(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-mono"
                            placeholder="FAC-XXXX-XX"
                        />
                        <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Bind'}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Bind this terminal to a specific facility for multi-branch sync.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                        <span className="block font-medium dark:text-slate-400">Environment</span>
                        {info?.environment}
                    </div>
                    <div>
                        <span className="block font-medium dark:text-slate-400">Installed At</span>
                        {new Date(info?.installed_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceInfo;
