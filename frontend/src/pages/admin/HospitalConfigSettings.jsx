import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
    Save,
    RefreshCw,
    Building2,
    Users,
    Shield,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle,
    Settings as SettingsIcon
} from 'lucide-react'
import {
    fetchHospitalConfig,
    updateHospitalConfig,
    toggleDepartment
} from '../../store/slices/hospitalConfigSlice'

const HospitalConfigSettings = () => {
    const dispatch = useDispatch()
    const { config, loading, error } = useSelector((state) => state.hospitalConfig)
    const [formData, setFormData] = useState({
        hospital_mode: 'FULL',
        allow_multi_role_users: true,
        require_role_switching: true,
        billing_interrupt_enabled: true,
        enabled_departments: ['lab', 'pharmacy', 'ward', 'radiology'],
        minimum_compliance_rules: {
            payment_before_consultation: false,
            payment_before_pharmacy: true,
            payment_before_lab: false,
            require_vitals_before_consultation: true,
        }
    })
    const [saveStatus, setSaveStatus] = useState(null)

    useEffect(() => {
        dispatch(fetchHospitalConfig())
    }, [dispatch])

    useEffect(() => {
        if (config) {
            setFormData({
                hospital_mode: config.hospital_mode || 'FULL',
                allow_multi_role_users: config.allow_multi_role_users ?? true,
                require_role_switching: config.require_role_switching ?? true,
                billing_interrupt_enabled: config.billing_interrupt_enabled ?? true,
                enabled_departments: config.enabled_departments || [],
                minimum_compliance_rules: config.minimum_compliance_rules || {}
            })
        }
    }, [config])

    const handleModeChange = (mode) => {
        setFormData({ ...formData, hospital_mode: mode })
    }

    const handleToggleChange = (field) => {
        setFormData({ ...formData, [field]: !formData[field] })
    }

    const handleDepartmentToggle = async (department) => {
        const enabled = !formData.enabled_departments.includes(department)
        await dispatch(toggleDepartment({ department, enabled }))

        // Update local state
        if (enabled) {
            setFormData({
                ...formData,
                enabled_departments: [...formData.enabled_departments, department]
            })
        } else {
            setFormData({
                ...formData,
                enabled_departments: formData.enabled_departments.filter(d => d !== department)
            })
        }
    }

    const handleComplianceRuleChange = (rule) => {
        setFormData({
            ...formData,
            minimum_compliance_rules: {
                ...formData.minimum_compliance_rules,
                [rule]: !formData.minimum_compliance_rules[rule]
            }
        })
    }

    const handleSave = async () => {
        try {
            await dispatch(updateHospitalConfig(formData)).unwrap()
            setSaveStatus('success')
            setTimeout(() => setSaveStatus(null), 3000)
        } catch (err) {
            setSaveStatus('error')
            setTimeout(() => setSaveStatus(null), 3000)
        }
    }

    const departments = [
        { id: 'lab', name: 'Laboratory', icon: '🔬', description: 'Lab tests and diagnostics' },
        { id: 'pharmacy', name: 'Pharmacy', icon: '💊', description: 'Drug dispensing and inventory' },
        { id: 'ward', name: 'In-Patient Ward', icon: '🏥', description: 'Patient admissions and ward management' },
        { id: 'radiology', name: 'Radiology', icon: '📷', description: 'Imaging and scans' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        Hospital Configuration
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Configure operational mode and system behavior
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Configuration
                </button>
            </div>

            {/* Save Status Alert */}
            {saveStatus && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border flex items-center gap-3 ${saveStatus === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                >
                    {saveStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                        {saveStatus === 'success'
                            ? 'Configuration saved successfully!'
                            : 'Failed to save configuration. Please try again.'}
                    </span>
                </motion.div>
            )}

            {/* Hospital Mode Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <SettingsIcon className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Operational Mode
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Full Mode */}
                    <button
                        onClick={() => handleModeChange('FULL')}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${formData.hospital_mode === 'FULL'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-3xl">🏥</div>
                            {formData.hospital_mode === 'FULL' && (
                                <CheckCircle className="w-6 h-6 text-indigo-600" />
                            )}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Full Department Mode
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Traditional large hospital setup with dedicated staff per department.
                            Each user has a single role with specific permissions.
                        </p>
                    </button>

                    {/* Compact Mode */}
                    <button
                        onClick={() => handleModeChange('COMPACT')}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${formData.hospital_mode === 'COMPACT'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-3xl">🏪</div>
                            {formData.hospital_mode === 'COMPACT' && (
                                <CheckCircle className="w-6 h-6 text-indigo-600" />
                            )}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Compact / Multi-Role Mode
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Small clinic setup where users can have multiple roles.
                            One person can handle reception, billing, and clinical tasks.
                        </p>
                    </button>
                </div>
            </div>

            {/* Multi-Role Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Multi-Role User Settings
                    </h2>
                </div>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.allow_multi_role_users}
                            onChange={() => handleToggleChange('allow_multi_role_users')}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                Allow Multi-Role Users
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Enable users to be assigned multiple roles (e.g., Doctor + Pharmacist)
                            </div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.require_role_switching}
                            onChange={() => handleToggleChange('require_role_switching')}
                            disabled={!formData.allow_multi_role_users}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                Require Explicit Role Switching
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Users must explicitly switch roles before performing role-specific actions (recommended for audit compliance)
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Enabled Departments */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Enabled Departments
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {departments.map((dept) => (
                        <label
                            key={dept.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={formData.enabled_departments.includes(dept.id)}
                                onChange={() => handleDepartmentToggle(dept.id)}
                                className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{dept.icon}</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {dept.name}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {dept.description}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Billing & Compliance Rules */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Billing & Compliance Rules
                    </h2>
                </div>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.billing_interrupt_enabled}
                            onChange={() => handleToggleChange('billing_interrupt_enabled')}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                Enable Billing Interrupts
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Require payment before proceeding to certain workflow steps
                            </div>
                        </div>
                    </label>

                    <div className="pl-8 space-y-3 border-l-2 border-slate-200 dark:border-slate-700">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.minimum_compliance_rules.payment_before_consultation}
                                onChange={() => handleComplianceRuleChange('payment_before_consultation')}
                                disabled={!formData.billing_interrupt_enabled}
                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                            />
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                Require payment before consultation
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.minimum_compliance_rules.payment_before_pharmacy}
                                onChange={() => handleComplianceRuleChange('payment_before_pharmacy')}
                                disabled={!formData.billing_interrupt_enabled}
                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                            />
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                Require payment before pharmacy dispensing
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.minimum_compliance_rules.payment_before_lab}
                                onChange={() => handleComplianceRuleChange('payment_before_lab')}
                                disabled={!formData.billing_interrupt_enabled}
                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                            />
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                Require payment before lab tests
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.minimum_compliance_rules.require_vitals_before_consultation}
                                onChange={() => handleComplianceRuleChange('require_vitals_before_consultation')}
                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                Require vitals recording before consultation
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Configuration Impact</p>
                    <p>
                        Changes to hospital mode and compliance rules will affect all users immediately.
                        Ensure all staff are informed before switching modes. Patient workflow integrity
                        is maintained across all modes.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default HospitalConfigSettings
