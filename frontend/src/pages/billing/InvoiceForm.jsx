import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, ArrowLeft, Plus, Trash2, Search,
    FileText, User, Calendar, DollarSign,
    Pill, FlaskConical, Stethoscope, Loader2, AlertCircle
} from 'lucide-react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { toast } from 'react-hot-toast'
import { formatKES } from '../../utils/format'

import { createInvoice } from '../../store/slices/billingSlice'
import { fetchPatients } from '../../store/slices/patientSlice'
import billingService from '../../services/billingService'

const invoiceSchema = z.object({
    patient_id: z.string().min(1, 'Patient is required'),
    invoice_date: z.date(),
    due_date: z.date().optional(),
    items: z.array(z.object({
        item_type: z.string(),
        item_name: z.string().min(1, 'Item name is required'),
        reference_id: z.string().optional(),
        quantity: z.number().min(1, 'Qty must be at least 1'),
        unit_price: z.number().min(0, 'Price must be positive'),
    })).min(1, 'Add at least one item'),
    discount_amount: z.number().min(0).default(0),
    tax_amount: z.number().min(0).default(0),
    notes: z.string().optional(),
})

const InvoiceForm = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [patientSearch, setPatientSearch] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [showPatientResults, setShowPatientResults] = useState(false)
    const { patients, loading: patientsLoading } = useSelector(state => state.patient)
    const { loading: billingLoading } = useSelector(state => state.billing)

    // Catalog State
    const [drugs, setDrugs] = useState([])
    const [labTests, setLabTests] = useState([])
    const [activeSearchRow, setActiveSearchRow] = useState(null)

    const { control, handleSubmit, watch, setValue, register, formState: { errors } } = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            invoice_date: new Date(),
            due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
            items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0 }],
            discount_amount: 0,
            tax_amount: 0
        }
    })

    const { fields, append, remove } = useFieldArray({ control, name: "items" })
    const watchedItems = watch("items")
    const discount = watch("discount_amount")
    const tax = watch("tax_amount")

    // Calculate totals
    const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0)
    const total = Math.max(0, subtotal + Number(tax) - Number(discount))

    // Patient Search Effect
    useEffect(() => {
        if (patientSearch.length > 2) {
            const timeoutId = setTimeout(() => {
                dispatch(fetchPatients({ search: patientSearch }))
                setShowPatientResults(true)
            }, 500)
            return () => clearTimeout(timeoutId)
        } else {
            setShowPatientResults(false)
        }
    }, [patientSearch, dispatch])

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient)
        setValue('patient_id', patient.id)
        setPatientSearch(`${patient.first_name} ${patient.last_name}`)
        setShowPatientResults(false)
    }

    const onSubmit = async (data) => {
        try {
            await dispatch(createInvoice({
                ...data,
                invoice_date: data.invoice_date.toISOString(),
                due_date: data.due_date?.toISOString(),
            })).unwrap()

            toast.success('Invoice created successfully!')
            navigate('/billing')
        } catch (err) {
            toast.error(err || 'Failed to create invoice')
        }
    }

    // Catalog Fetchers
    const searchCatalog = async (index, type, query) => {
        if (!query || query.length < 2) return

        try {
            if (type === 'drug') {
                const res = await billingService.getDrugs(query)
                setDrugs(res.data)
            } else if (type === 'test') {
                const res = await billingService.getLabTests(query)
                setLabTests(res.data)
            }
            setActiveSearchRow(index)
        } catch (error) {
            console.error(error)
        }
    }

    const selectCatalogItem = (index, item, type) => {
        setValue(`items.${index}.item_name`, type === 'drug' ? item.brand_name || item.generic_name : item.test_name)
        setValue(`items.${index}.unit_price`, Number(item.unit_price || item.price))
        setValue(`items.${index}.reference_id`, item.id)
        setActiveSearchRow(null)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/billing')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Invoice</h1>
                        <p className="text-sm text-slate-500">Create a new bill for patient services.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-4 hidden sm:block">
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Amount</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatKES(total)}</p>
                    </div>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={billingLoading}
                        className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70"
                    >
                        {billingLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Patient & Details */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Patient Info</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                placeholder="Search Patient..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white"
                            />
                            {showPatientResults && (
                                <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                                    {patientsLoading ? (
                                        <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
                                    ) : patients.length > 0 ? (
                                        patients.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handlePatientSelect(p)}
                                                className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.first_name} {p.last_name}</p>
                                                    <p className="text-xs text-slate-500">#{p.patient_number}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-500">No patients found.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedPatient && (
                            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                                        {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                        <p className="text-xs text-slate-500 dark:text-indigo-300">{selectedPatient.email || selectedPatient.phone}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {errors.patient_id && <p className="text-xs text-red-500 mt-1">{errors.patient_id.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Date</label>
                            <Controller
                                control={control}
                                name="invoice_date"
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={field.onChange}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Due Date</label>
                            <Controller
                                control={control}
                                name="due_date"
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={field.onChange}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Notes</label>
                        <textarea
                            {...register('notes')}
                            rows="4"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white resize-none"
                            placeholder="Additional comments..."
                        ></textarea>
                    </div>
                </div>

                {/* Right Column: Line Items */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" /> Line Items
                        </h2>
                        <button
                            type="button"
                            onClick={() => append({ item_type: 'service', item_name: '', quantity: 1, unit_price: 0 })}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold text-sm flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Item
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl relative group items-start">
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Type</label>
                                    <select
                                        {...register(`items.${index}.item_type`)}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-medium shadow-sm outline-none dark:text-white"
                                    >
                                        <option value="service" className="text-blue-600">Service</option>
                                        <option value="drug" className="text-emerald-600">Drug</option>
                                        <option value="test" className="text-purple-600">Lab Test</option>
                                    </select>
                                </div>
                                <div className="col-span-9 sm:col-span-5 relative">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Description</label>
                                    <input
                                        {...register(`items.${index}.item_name`)}
                                        onChange={(e) => {
                                            register(`items.${index}.item_name`).onChange(e)
                                            searchCatalog(index, watchedItems[index]?.item_type, e.target.value)
                                        }}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm shadow-sm outline-none dark:text-white placeholder:text-slate-300"
                                        placeholder="Item name..."
                                        autoComplete="off"
                                    />
                                    {/* Catalog Dropdown */}
                                    {activeSearchRow === index && (watchedItems[index].item_type === 'drug' || watchedItems[index].item_type === 'test') && (
                                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto">
                                            {watchedItems[index].item_type === 'drug' && drugs.map((drug) => (
                                                <button
                                                    key={drug.id}
                                                    type="button"
                                                    onClick={() => selectCatalogItem(index, drug, 'drug')}
                                                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex justify-between"
                                                >
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{drug.brand_name || drug.generic_name}</span>
                                                    <span className="text-slate-400 text-xs">{formatKES(drug.unit_price)}</span>
                                                </button>
                                            ))}
                                            {watchedItems[index].item_type === 'test' && labTests.map((test) => (
                                                <button
                                                    key={test.id}
                                                    type="button"
                                                    onClick={() => selectCatalogItem(index, test, 'test')}
                                                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex justify-between"
                                                >
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{test.test_name}</span>
                                                    <span className="text-slate-400 text-xs">{formatKES(test.price)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Qty</label>
                                    <input
                                        type="number"
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-center shadow-sm outline-none dark:text-white"
                                    />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Price</label>
                                    <input
                                        type="number" step="0.01"
                                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-right shadow-sm outline-none dark:text-white"
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-1 flex justify-end items-end pt-6">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatKES(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Discount</span>
                            <div className="w-32">
                                <input
                                    type="number"
                                    {...register('discount_amount', { valueAsNumber: true })}
                                    className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-right outline-none dark:text-white text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Tax</span>
                            <div className="w-32">
                                <input
                                    type="number"
                                    {...register('tax_amount', { valueAsNumber: true })}
                                    className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-right outline-none dark:text-white text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-lg pt-4 border-t border-slate-100 dark:border-slate-700">
                            <span className="font-bold text-slate-900 dark:text-white">Grand Total</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatKES(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceForm
