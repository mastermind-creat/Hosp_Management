import React, { useState, useEffect } from 'react';
import { Save, Building, Wallet, Globe, Grip, Languages } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const SystemSettings = () => {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings');
            setSettings(response.data);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (group, key, value) => {
        setSettings(prev => ({
            ...prev,
            [group]: prev[group].map(item =>
                item.key === key ? { ...item, value } : item
            )
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const allSettings = Object.values(settings).flat();
            const payload = {
                settings: allSettings.map(({ key, value }) => ({ key, value }))
            };

            await api.post('/settings', payload);

            // Check if language was changed
            const langSetting = allSettings.find(s => s.key === 'system_language');
            if (langSetting) {
                i18n.changeLanguage(langSetting.value);
            }

            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading configuration...</div>;

    const tabs = [
        { id: 'general', label: 'General Info', icon: Building },
        { id: 'finance', label: 'Finance & Tax', icon: Wallet },
        { id: 'system', label: 'System Settings', icon: Languages },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Globe className="w-8 h-8 text-indigo-600" />
                        System Configuration
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage global application settings and preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center p-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-slate-200 dark:border-slate-700'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5 mr-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 capitalize">{activeTab} Settings</h2>

                    <div className="space-y-6 max-w-3xl">
                        {settings[activeTab]?.map((setting) => (
                            <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                        {setting.label || setting.key}
                                    </label>
                                    <p className="text-xs text-slate-500 mt-1">{setting.description}</p>
                                </div>
                                <div className="md:col-span-2">
                                    {setting.type === 'number' ? (
                                        <input
                                            type="number"
                                            value={setting.value}
                                            onChange={(e) => handleChange(activeTab, setting.key, e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : setting.type === 'select' ? (
                                        <select
                                            value={setting.value}
                                            onChange={(e) => handleChange(activeTab, setting.key, e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
                                        >
                                            {setting.options?.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => handleChange(activeTab, setting.key, e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {(!settings[activeTab] || settings[activeTab].length === 0) && (
                            <div className="text-center py-10 text-slate-400">
                                No settings available for this section.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
