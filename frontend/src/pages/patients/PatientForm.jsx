import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Shield,
    ArrowLeft,
    Save,
    Loader2,
    Info,
    Smartphone
} from 'lucide-react'
import { createPatient, fetchPatientById, updatePatient } from '../../store/slices/patientSlice'
import { toast } from 'react-hot-toast'

const patientSchema = z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address').or(z.literal('')),
    phone: z.string().min(10, 'Valid phone number is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().min(5, 'Address is required'),
    national_id: z.string().min(5, 'ID/Passport number is required'),
    emergency_contact_name: z.string().min(2, 'Emergency contact name is required'),
    emergency_contact_phone: z.string().min(10, 'Emergency contact phone is required'),
})

const PatientForm = () => {
    const { id } = useParams()
    const isEdit = !!id
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading, currentPatient } = useSelector((state) => state.patient)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            gender: 'male'
        }
    })

    useEffect(() => {
        if (isEdit) {
            dispatch(fetchPatientById(id))
        }
    }, [dispatch, id, isEdit])

    useEffect(() => {
        if (isEdit && currentPatient) {
            reset(currentPatient)
        }
    }, [currentPatient, isEdit, reset])

    const onSubmit = async (data) => {
        const result = isEdit
            ? await dispatch(updatePatient({ id, data }))
            : await dispatch(createPatient(data))

        if (!result.error) {
            toast.success(isEdit ? 'Patient updated successfully' : 'Patient registered successfully')
            navigate('/patients')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registry
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-6 border-b border-slate-100 dark:border-slate-700">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'Update Patient Record' : 'New Patient Registration'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Fill in all the required medical and personal information.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    {/* Personal Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <User className="w-5 h-5 font-bold" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">First Name</label>
                                <input
                                    {...register('first_name')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g John"
                                />
                                {errors.first_name && <p className="text-xs text-red-500 ml-1">{errors.first_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
                                <input
                                    {...register('last_name')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g Doe"
                                />
                                {errors.last_name && <p className="text-xs text-red-500 ml-1">{errors.last_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Gender</label>
                                <select
                                    {...register('gender')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Date of Birth</label>
                                <input
                                    {...register('date_of_birth')}
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                />
                                {errors.date_of_birth && <p className="text-xs text-red-500 ml-1">{errors.date_of_birth.message}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Contact Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Smartphone className="w-5 h-5 font-bold" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Contact & Identification</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                                <input
                                    {...register('phone')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="+254 700 000 000"
                                />
                                {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address (Optional)</label>
                                <input
                                    {...register('email')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="john.doe@example.com"
                                />
                                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">ID / Passport Number</label>
                                <input
                                    {...register('national_id')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="National ID or Passport"
                                />
                                {errors.national_id && <p className="text-xs text-red-500 ml-1">{errors.national_id.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Physical Address</label>
                                <input
                                    {...register('address')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Estate, House No, City"
                                />
                                {errors.address && <p className="text-xs text-red-500 ml-1">{errors.address.message}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Emergency Contact */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Shield className="w-5 h-5 font-bold" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Emergency Contact</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Contact Name</label>
                                <input
                                    {...register('emergency_contact_name')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Next of Kin Name"
                                />
                                {errors.emergency_contact_name && <p className="text-xs text-red-500 ml-1">{errors.emergency_contact_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Contact Phone</label>
                                <input
                                    {...register('emergency_contact_phone')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Emergency Phone Number"
                                />
                                {errors.emergency_contact_phone && <p className="text-xs text-red-500 ml-1">{errors.emergency_contact_phone.message}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => navigate('/patients')}
                            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> {isEdit ? 'Update Record' : 'Save Patient'}</>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl flex items-start">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> If you are offline, the patient record will be saved locally and synced automatically when a connection is restored.
                </p>
            </div>
        </div >
    )
}

export default PatientForm
