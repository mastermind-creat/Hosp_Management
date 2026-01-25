import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO, isValid } from 'date-fns'
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
    middle_name: z.string().optional(),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address').or(z.literal('')),
    phone: z.string().min(10, 'Valid phone number is required'),
    date_of_birth: z.any().refine((val) => val !== null && val !== undefined, {
        message: "Date of birth is required",
    }),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().optional(),
    national_id: z.string().optional(),
    emergency_contact_name: z.string().min(2, 'Emergency contact name is required'),
    emergency_contact_phone: z.string().min(10, 'Emergency contact phone is required'),
    emergency_contact_relationship: z.string().optional(),
    insurance_type: z.enum(['nhif', 'shif', 'private', 'corporate', 'none']).default('none'),
    insurance_provider: z.string().optional(),
    insurance_number: z.string().optional(),
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
        watch,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            gender: 'male',
            insurance_type: 'none'
        }
    })

    const insuranceType = watch('insurance_type')

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
        // Format date to YYYY-MM-DD for backend
        const formattedData = {
            ...data,
            date_of_birth: data.date_of_birth instanceof Date
                ? format(data.date_of_birth, 'yyyy-MM-dd')
                : typeof data.date_of_birth === 'string' && data.date_of_birth.includes('T')
                    ? data.date_of_birth.split('T')[0]
                    : data.date_of_birth
        }

        const result = isEdit
            ? await dispatch(updatePatient({ id, data: formattedData }))
            : await dispatch(createPatient(formattedData))

        if (!result.error) {
            toast.success(isEdit ? 'Patient updated successfully' : 'Patient registered successfully')
            // navigate('/patients') // Removed to stay on page as requested
        } else {
            toast.error(result.payload || (isEdit ? 'Failed to update patient' : 'Failed to register patient'))
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

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
                    {/* Personal Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <User className="w-5 h-5 font-bold" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-wider">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">First Name <span className="text-rose-500">*</span></label>
                                <input
                                    {...register('first_name')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g John"
                                />
                                {errors.first_name && <p className="text-xs text-red-500 ml-1 font-medium">{errors.first_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Middle Name (Optional)</label>
                                <input
                                    {...register('middle_name')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g. Mwangi"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name <span className="text-rose-500">*</span></label>
                                <input
                                    {...register('last_name')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="e.g Doe"
                                />
                                {errors.last_name && <p className="text-xs text-red-500 ml-1 font-medium">{errors.last_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Gender <span className="text-rose-500">*</span></label>
                                <select
                                    {...register('gender')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Date of Birth <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <Controller
                                        control={control}
                                        name="date_of_birth"
                                        render={({ field }) => (
                                            <DatePicker
                                                selected={field.value ? (field.value instanceof Date ? field.value : parseISO(field.value)) : null}
                                                onChange={(date) => field.onChange(date)}
                                                dateFormat="yyyy-MM-dd"
                                                maxDate={new Date()}
                                                showYearDropdown
                                                scrollableYearDropdown
                                                yearDropdownItemNumber={100}
                                                placeholderText="Select date of birth"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                                autoComplete="off"
                                            />
                                        )}
                                    />
                                </div>
                                {errors.date_of_birth && <p className="text-xs text-red-500 ml-1 font-medium">{errors.date_of_birth.message}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Contact Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <Smartphone className="w-5 h-5 font-bold" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-wider">Contact & Identification</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none group-focus-within:text-indigo-500 text-slate-400 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        {...register('phone')}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="+254 700 000 000"
                                    />
                                </div>
                                {errors.phone && <p className="text-xs text-red-500 ml-1 font-medium">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address (Optional)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none group-focus-within:text-indigo-500 text-slate-400 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="john.doe@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">ID / Passport Number</label>
                                <input
                                    {...register('national_id')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="National ID or Passport"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Physical Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none group-focus-within:text-indigo-500 text-slate-400 transition-colors">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        {...register('address')}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="Estate, House No, City"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Emergency Contact */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <Shield className="w-5 h-5 font-bold" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-wider">Emergency Contact</h2>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Contact Name <span className="text-rose-500">*</span></label>
                                <input
                                    {...register('emergency_contact_name')}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Next of Kin Name"
                                />
                                {errors.emergency_contact_name && <p className="text-xs text-red-500 ml-1 font-medium">{errors.emergency_contact_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Contact Phone <span className="text-rose-500">*</span></label>
                                <input
                                    {...register('emergency_contact_phone')}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Emergency Phone Number"
                                />
                                {errors.emergency_contact_phone && <p className="text-xs text-red-500 ml-1 font-medium">{errors.emergency_contact_phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Relationship</label>
                                <select
                                    {...register('emergency_contact_relationship')}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none"
                                >
                                    <option value="">Select Relationship</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="parent">Parent</option>
                                    <option value="child">Child</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="guardian">Guardian</option>
                                    <option value="friend">Friend</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Insurance Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <Shield className="w-5 h-5 font-bold" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-wider">Insurance Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Insurance Type</label>
                                <select
                                    {...register('insurance_type')}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none"
                                >
                                    <option value="none">Self-Pay / None</option>
                                    <option value="shif">SHIF / SHA</option>
                                    <option value="nhif">NHIF (Legacy)</option>
                                    <option value="private">Private Insurance</option>
                                    <option value="corporate">Corporate Bill</option>
                                </select>
                            </div>
                            {insuranceType !== 'none' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Provider Name</label>
                                        <input
                                            {...register('insurance_provider')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                            placeholder="e.g Jubilee, Britam"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Policy / Member Number</label>
                                        <input
                                            {...register('insurance_number')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                            placeholder="Enter Policy Number"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => navigate('/patients')}
                            className="px-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-75 disabled:cursor-not-allowed"
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
