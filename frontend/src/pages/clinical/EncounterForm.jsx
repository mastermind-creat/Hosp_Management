import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity,
    Stethoscope,
    Pill,
    FileText,
    Save,
    ArrowLeft,
    Thermometer,
    Heart,
    Wind,
    Scale,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Zap,
    ChevronDown,
    ArrowRightLeft,
    FlaskConical,
    Briefcase
} from 'lucide-react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    recordVitals,
    recordDiagnosis,
    storeTreatmentNote,
    clearCurrentVisit,
    fetchEncounterDetails,
    fetchClinicalTemplates,
    completeVisit
} from '../../store/slices/clinicalSlice'
import { fetchPatientById } from '../../store/slices/patientSlice'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import TransferModal from '../../components/clinical/TransferModal'
import DrugSelector from '../../components/clinical/DrugSelector'
import LabTestSelector from '../../components/clinical/LabTestSelector'
import ServiceSelector from '../../components/clinical/ServiceSelector'

const encounterSchema = z.object({
    vitals: z.object({
        temperature: z.string().optional(),
        blood_pressure: z.string().optional(),
        pulse_rate: z.string().optional(),
        respiratory_rate: z.string().optional(),
        weight: z.string().optional(),
        height: z.string().optional(),
        oxygen_saturation: z.string().optional(),
    }),
    clinical: z.object({
        chief_complaint: z.string().min(5, 'Chief complaint is required'),
        history: z.string().optional(),
        examination: z.string().optional(),
        diagnosis: z.string().min(3, 'Diagnosis is required'),
        treatment_plan: z.string().optional(),
    }),
    prescriptions: z.array(z.object({
        drug_name: z.string().min(2, 'Drug name is required'),
        dosage: z.string().min(2, 'Dosage is required'),
        frequency: z.string().min(2, 'Frequency is required'),
        duration_days: z.string().min(1, 'Duration is required'),
        quantity: z.string().min(1, 'Quantity is required'),
        instructions: z.string().optional(),
    }))
})

const TabButton = ({ id, active, icon: Icon, label, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
)


const TemplateSelector = ({ type, onSelect }) => {
    const { templates = [] } = useSelector(state => state.clinical || {});
    const [isOpen, setIsOpen] = useState(false);

    const filtered = templates.filter(t => t.type === type && t.is_active);

    if (filtered.length === 0) return null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800"
            >
                <Zap className="w-3 h-3" />
                Fast Select
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 overflow-hidden py-2"
                        >
                            <div className="px-3 py-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggestions</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filtered.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            onSelect(t.content);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                    >
                                        <p className="font-bold mb-0.5">{t.label}</p>
                                        <p className="truncate opacity-60 italic">{t.content}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

const EncounterForm = () => {
    const { patientId, encounterId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentPatient } = useSelector((state) => state.patient)
    const { templates = [] } = useSelector((state) => state.clinical || {})
    const [activeTab, setActiveTab] = useState('vitals')
    const [saving, setSaving] = useState(false)
    const [visitId, setVisitId] = useState(encounterId || null)
    const [isTransferOpen, setIsTransferOpen] = useState(false)
    const [selectedTests, setSelectedTests] = useState([])
    const [selectedServices, setSelectedServices] = useState([])
    const isEditMode = !!encounterId

    const { register, control, handleSubmit, formState: { errors }, trigger, watch, setValue } = useForm({
        resolver: zodResolver(encounterSchema),
        defaultValues: {
            vitals: {},
            clinical: {},
            prescriptions: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "prescriptions"
    })

    useEffect(() => {
        if (patientId) {
            dispatch(fetchPatientById(patientId))
        }
        dispatch(fetchClinicalTemplates({ active_only: 1 }))
    }, [dispatch, patientId])

    useEffect(() => {
        if (isEditMode) {
            const loadEncounter = async () => {
                try {
                    const res = await dispatch(fetchEncounterDetails(encounterId)).unwrap()

                    // Populate Vitals
                    if (res.vitals) {
                        setValue('vitals.temperature', res.vitals.temperature?.toString() || '')
                        setValue('vitals.blood_pressure', res.vitals.blood_pressure || '')
                        setValue('vitals.pulse_rate', res.vitals.pulse_rate?.toString() || '')
                        setValue('vitals.respiratory_rate', res.vitals.respiratory_rate?.toString() || '')
                        setValue('vitals.weight', res.vitals.weight?.toString() || '')
                        setValue('vitals.height', res.vitals.height?.toString() || '')
                        setValue('vitals.oxygen_saturation', res.vitals.oxygen_saturation?.toString() || '')
                    }

                    // Populate Clinical Notes
                    setValue('clinical.chief_complaint', res.chief_complaint || '')
                    setValue('clinical.history', res.history_of_present_illness || '')
                    setValue('clinical.examination', res.examination_findings || '')
                    setValue('clinical.diagnosis', res.diagnosis || '')
                    setValue('clinical.treatment_plan', res.treatment_plan || '')

                    // Populate Prescriptions
                    if (res.prescriptions && res.prescriptions.length > 0) {
                        const allItems = res.prescriptions.reduce((acc, rx) => {
                            const items = rx.items.map(item => ({
                                drug_name: item.drug_name,
                                dosage: item.dosage,
                                frequency: item.frequency,
                                duration_days: item.duration_days?.toString() || '',
                                quantity: item.quantity?.toString() || '',
                                instructions: item.instructions || ''
                            }))
                            return [...acc, ...items]
                        }, [])
                        setValue('prescriptions', allItems)
                    }

                    // Populate Tests & Services
                    if (res.test_requests) {
                        setSelectedTests(res.test_requests.map(tr => tr.test).filter(Boolean))
                    }
                    if (res.visit_services) {
                        setSelectedServices(res.visit_services.map(vs => vs.service).filter(Boolean))
                    }

                } catch (err) {
                    toast.error('Failed to load encounter details')
                }
            }
            loadEncounter()
        }
    }, [isEditMode, encounterId, dispatch, setValue])

    const startVisit = async () => {
        try {
            const res = await api.post(`/patients/${patientId}/visits`, {
                visit_type: 'opd',
                visit_date: new Date().toISOString(),
                status: 'active',
                visit_number: `VST-${Math.random().toString(36).substring(7).toUpperCase()}`
            })
            setVisitId(res.data.id)
            return res.data.id
        } catch (err) {
            console.error('Visit creation error:', err)
            toast.error(err.response?.data?.message || 'Failed to start visit session')
            return null
        }
    }

    const saveVitals = async () => {
        const isValid = await trigger('vitals')
        if (!isValid) return

        setSaving(true)
        try {
            let id = visitId
            if (!id) {
                id = await startVisit()
            }
            if (!id) return

            const data = watch('vitals')
            await dispatch(recordVitals({ visitId: id, vitalsData: { ...data, visit_id: id } })).unwrap()

            toast.success('Vitals saved successfully')
            setActiveTab('notes')
        } catch (err) {
            toast.error(err?.message || 'Failed to save vitals')
        } finally {
            setSaving(false)
        }
    }

    const saveClinicalNotes = async () => {
        const isValid = await trigger('clinical')
        if (!isValid) return

        setSaving(true)
        try {
            let id = visitId
            if (!id) {
                id = await startVisit()
            }
            if (!id) return

            const data = watch('clinical')
            await dispatch(recordDiagnosis({
                visitId: id,
                diagnosisData: {
                    diagnosis: data.diagnosis,
                    treatment_plan: data.treatment_plan || '',
                    chief_complaint: data.chief_complaint,
                    history_of_present_illness: data.history || '',
                    examination_findings: data.examination || ''
                }
            })).unwrap()

            toast.success('Clinical notes saved successfully')
            setActiveTab('rx')
        } catch (err) {
            toast.error(err?.message || 'Failed to save clinical notes')
        } finally {
            setSaving(false)
        }
    }

    const finalizeEncounter = async () => {
        const isValid = await trigger('prescriptions')
        const hasNotes = await trigger('clinical') // Ensure diagnosis is there at least
        if (!isValid || !hasNotes) {
            if (!hasNotes) {
                toast.error('Diagnosis & Chief Complaint are required!')
                setActiveTab('notes')
            }
            return
        }

        setSaving(true)
        try {
            let id = visitId
            if (!id) {
                id = await startVisit()
            }
            if (!id) return

            const rxData = watch('prescriptions')
            const clinicalData = watch('clinical')

            if (rxData && rxData.length > 0) {
                await api.post(`/clinical/visits/${id}/prescriptions`, {
                    items: rxData,
                    notes: clinicalData.treatment_plan || ''
                })
            }

            if (selectedTests.length > 0) {
                await api.post(`/clinical/visits/${id}/lab-requests`, {
                    tests: selectedTests.map(t => ({ id: t.id })),
                    priority: 'routine'
                })
            }

            if (selectedServices.length > 0) {
                await api.post(`/clinical/visits/${id}/services`, {
                    services: selectedServices.map(s => ({ id: s.id, quantity: 1 }))
                })
            }

            toast.success('Encounter completed successfully!')
            // No longer auto-navigate immediately to allow for transfer choice
            // navigate(`/patients/${patientId}`)
            return true
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete encounter')
            return false
        } finally {
            setSaving(false)
        }
    }

    const handleFinalizeAndNavigate = async () => {
        const success = await finalizeEncounter()
        if (success) {
            try {
                await dispatch(completeVisit(visitId)).unwrap()
                navigate(`/patients/${patientId}`)
            } catch (err) {
                toast.error('Encounter saved but failed to complete queue session')
                // Still navigate? Or stay? Probably stay if completion failed.
            }
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isEditMode ? 'Edit Medical Encounter' : 'New Medical Encounter'}
                        </h1>
                        {currentPatient && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Patient: <span className="font-bold text-slate-700 dark:text-slate-200">{currentPatient.first_name} {currentPatient.last_name}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Stage</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">{activeTab.replace('rx', 'Prescriptions')}</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex p-1.5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto scollbar-hide">
                <TabButton id="vitals" active={activeTab === 'vitals'} label="Vitals" icon={Activity} onClick={setActiveTab} />
                <TabButton id="notes" active={activeTab === 'notes'} label="Clinical Notes" icon={Stethoscope} onClick={setActiveTab} />
                <TabButton id="investigations" active={activeTab === 'investigations'} label="Investigations" icon={FlaskConical} onClick={setActiveTab} />
                <TabButton id="services" active={activeTab === 'services'} label="Services" icon={Briefcase} onClick={setActiveTab} />
                <TabButton id="rx" active={activeTab === 'rx'} label="Prescriptions" icon={Pill} onClick={setActiveTab} />
            </div>

            {/* Form Content */}
            <form className="space-y-6">
                <AnimatePresence mode="wait">
                    {/* Vitals Tab */}
                    {activeTab === 'vitals' && (
                        <motion.div
                            key="vitals"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Thermometer className="w-4 h-4 text-orange-500" /> Temperature (°C)
                                    </label>
                                    <input
                                        {...register('vitals.temperature')}
                                        type="number" step="0.1"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 36.5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-red-500" /> Blood Pressure
                                    </label>
                                    <input
                                        {...register('vitals.blood_pressure')}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 120/80"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-pink-500 animate-pulse" /> Pulse Rate (bpm)
                                    </label>
                                    <input
                                        {...register('vitals.pulse_rate')}
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 72"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Wind className="w-4 h-4 text-blue-400" /> Oxygen Sat. (%)
                                    </label>
                                    <input
                                        {...register('vitals.oxygen_saturation')}
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 98"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-indigo-400" /> Weight (kg)
                                    </label>
                                    <input
                                        {...register('vitals.weight')}
                                        type="number" step="0.1"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 70"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-indigo-400" /> Height (cm)
                                    </label>
                                    <input
                                        {...register('vitals.height')}
                                        type="number" step="0.1"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 175"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-emerald-400" /> Respiration (bpm)
                                    </label>
                                    <input
                                        {...register('vitals.respiratory_rate')}
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g 18"
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-3xl text-white">
                                <h3 className="text-lg font-bold mb-4">Vitals Summary</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-xs text-slate-400 font-bold uppercase">BMI Indicator</p>
                                        <p className="text-2xl font-bold mt-1">--.-</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Calculated automatically from Wt/Ht</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                        <p className="text-xs text-emerald-400 font-bold uppercase">Status</p>
                                        <p className="text-sm mt-1">Vitals are within normal range for an adult.</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={saveVitals}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 mt-4"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                                        Save Vitals & Continue
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Clinical Notes Tab */}
                    {activeTab === 'notes' && (
                        <motion.div
                            key="notes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Chief Complaint</label>
                                            <TemplateSelector type="complaint" onSelect={(content) => setValue('clinical.chief_complaint', content)} />
                                        </div>
                                        <textarea
                                            {...register('clinical.chief_complaint')}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                            placeholder="What brings the patient in today?"
                                        ></textarea>
                                        {errors.clinical?.chief_complaint && <p className="text-xs text-red-500 ml-1">{errors.clinical.chief_complaint.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Examination Findings</label>
                                            <TemplateSelector type="finding" onSelect={(content) => setValue('clinical.examination', content)} />
                                        </div>
                                        <textarea
                                            {...register('clinical.examination')}
                                            rows="5"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                            placeholder="Physical observations and system examination..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Diagnosis / Impression</label>
                                            <TemplateSelector type="diagnosis" onSelect={(content) => setValue('clinical.diagnosis', content)} />
                                        </div>
                                        <textarea
                                            {...register('clinical.diagnosis')}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                            placeholder="Final or differential diagnosis..."
                                        ></textarea>
                                        {errors.clinical?.diagnosis && <p className="text-xs text-red-500 ml-1">{errors.clinical.diagnosis.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Treatment Plan</label>
                                            <TemplateSelector type="plan" onSelect={(content) => setValue('clinical.treatment_plan', content)} />
                                        </div>
                                        <textarea
                                            {...register('clinical.treatment_plan')}
                                            rows="5"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                            placeholder="Managed steps, followup dates, and counseling..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end p-8 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 rounded-b-3xl mt-6">
                                <button
                                    type="button"
                                    onClick={saveClinicalNotes}
                                    disabled={saving}
                                    className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                                    Save Notes & Continue
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Investigations Tab */}
                    {activeTab === 'investigations' && (
                        <motion.div
                            key="investigations"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            <h3 className="font-bold text-slate-900 dark:text-white">Order Lab Tests</h3>
                            <LabTestSelector
                                selectedTests={selectedTests}
                                onTestsChange={setSelectedTests}
                            />

                            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('services')}
                                    className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    Continue to Services
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            <h3 className="font-bold text-slate-900 dark:text-white">Procedures & Services</h3>
                            <ServiceSelector
                                selectedServices={selectedServices}
                                onServicesChange={setSelectedServices}
                            />

                            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('rx')}
                                    className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    Continue to Prescriptions
                                </button>
                            </div>
                        </motion.div>
                    )}


                    {/* Prescription Tab */}
                    {activeTab === 'rx' && (
                        <motion.div
                            key="rx"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white">Drug Prescriptions</h3>
                                <button
                                    type="button"
                                    onClick={() => append({})}
                                    className="flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-1.5" /> Add Drug
                                </button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl relative group z-10 focus-within:z-20">
                                        <div className="md:col-span-4 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Drug Name</label>
                                            <Controller
                                                control={control}
                                                name={`prescriptions.${index}.drug_name`}
                                                render={({ field }) => (
                                                    <DrugSelector
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onSelect={(drug) => {
                                                            setValue(`prescriptions.${index}.dosage`, drug.strength || '')
                                                            // Also auto-calculate quantity if possible, or focus next field
                                                        }}
                                                        placeholder="Search generic/brand..."
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dosage</label>
                                            <input
                                                {...register(`prescriptions.${index}.dosage`)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white"
                                                placeholder="e.g 500mg"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Freq (TDS/BD)</label>
                                            <input
                                                {...register(`prescriptions.${index}.frequency`)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white"
                                                placeholder="e.g 2x3"
                                            />
                                        </div>
                                        <div className="md:col-span-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Days</label>
                                            <input
                                                {...register(`prescriptions.${index}.duration_days`)}
                                                type="number"
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white"
                                                placeholder="e.g 5"
                                            />
                                        </div>
                                        <div className="md:col-span-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Qty</label>
                                            <input
                                                {...register(`prescriptions.${index}.quantity`)}
                                                type="number"
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white"
                                                placeholder="e.g 15"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                                        <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No prescriptions added for this visit.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end p-8 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 rounded-b-3xl mt-6">
                                <button
                                    type="button"
                                    onClick={handleFinalizeAndNavigate}
                                    disabled={saving}
                                    className="flex items-center px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
                                    Finalize Encounter
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const success = await finalizeEncounter()
                                        if (success) setIsTransferOpen(true)
                                    }}
                                    disabled={saving}
                                    className="flex items-center px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ArrowRightLeft className="w-5 h-5 mr-3" />}
                                    Finalize & Transfer
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {visitId && (
                <TransferModal
                    isOpen={isTransferOpen}
                    onClose={() => {
                        setIsTransferOpen(false)
                        navigate(`/patients/${patientId}`)
                    }}
                    visitId={visitId}
                    patientName={currentPatient ? `${currentPatient.first_name} ${currentPatient.last_name}` : 'Patient'}
                    onTransferred={() => navigate(`/patients/${patientId}`)}
                />
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Review Clinical Summary:</strong> Please ensure all findings are correctly documented before completing the encounter. Once committed, clinical records are immutable for audit compliance.
                </p>
            </div>
        </div>
    )
}

export default EncounterForm
