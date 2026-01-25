import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    Save, ArrowLeft, Plus, Trash2, Search,
    FileText, User, Calendar,
    Pill, FlaskConical, Stethoscope, Loader2, AlertCircle,
    CreditCard, Printer, Download, Check, X, ArrowRightLeft
} from 'lucide-react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { toast } from 'react-hot-toast'
import { formatKES } from '../../utils/format'
import { downloadBlob } from '../../utils/download'
import TransferModal from '../../components/clinical/TransferModal'
import ThermalReceipt from '../../components/billing/ThermalReceipt'
import { motion, AnimatePresence } from 'framer-motion'

import { createInvoice } from '../../store/slices/billingSlice'
import { fetchPatients, fetchPatientById } from '../../store/slices/patientSlice'
import { fetchEncounterDetails, completeVisit } from '../../store/slices/clinicalSlice'
import billingService from '../../services/billingService'
import api from '../../services/api'

const invoiceSchema = z.object({
    patient_id: z.string().min(1, 'Patient is required'),
    visit_id: z.string().optional(),
    invoice_date: z.date(),
    due_date: z.date().optional(),
    items: z.array(z.object({
        item_type: z.string(),
        item_name: z.string().min(1, 'Item name is required'),
        reference_id: z.string().optional().nullable(),
        quantity: z.number().min(1, 'Qty must be at least 1'),
        unit_price: z.number().min(0, 'Price must be positive'),
        is_locked: z.boolean().optional().default(false),
    })).min(1, 'Add at least one item'),
    discount_amount: z.number().min(0).default(0),
    tax_amount: z.number().min(0).default(0),
    notes: z.string().optional(),
    payment: z.object({
        amount: z.number().min(0).optional(),
        payment_method: z.string().optional(),
        reference_number: z.string().optional(),
    }).optional(),
})

const InvoiceForm = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [patientSearch, setPatientSearch] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [showPatientResults, setShowPatientResults] = useState(false)
    const { patients, currentPatient, loading: patientsLoading } = useSelector(state => state.patient)
    const { currentVisit, loading: clinicalLoading } = useSelector(state => state.clinical)
    const { loading: billingLoading } = useSelector(state => state.billing)

    // Workflow States
    const [isTransferOpen, setIsTransferOpen] = useState(false)
    const [createdInvoiceId, setCreatedInvoiceId] = useState(null)
    const [savedInvoice, setSavedInvoice] = useState(null)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [hospitalInfo, setHospitalInfo] = useState(null)
    const [downloading, setDownloading] = useState(false)

    const { control, handleSubmit, watch, setValue, register, formState: { errors } } = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            invoice_date: new Date(),
            due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
            items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, is_locked: false }],
            discount_amount: 0,
            tax_amount: 0,
            payment: {
                payment_method: 'cash',
                amount: 0,
                reference_number: ''
            }
        }
    })

    const { fields, append, remove } = useFieldArray({ control, name: "items" })
    const watchedItems = watch("items")
    const discount = watch("discount_amount")
    const tax = watch("tax_amount")

    // Catalog State
    const [drugs, setDrugs] = useState([])
    const [labTests, setLabTests] = useState([])
    const [activeSearchRow, setActiveSearchRow] = useState(null)

    // Parse URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const patientId = params.get('patient_id');
        const visitId = params.get('visit_id');
        const name = params.get('name');

        if (patientId) {
            dispatch(fetchPatientById(patientId));
            setValue('patient_id', patientId);
            if (name) setPatientSearch(name.replace('+', ' '));
        }

        if (visitId) {
            setValue('visit_id', visitId);
            dispatch(fetchEncounterDetails(visitId));
        }
    }, [location.search, dispatch, setValue]);

    const loadedVisitIdRef = useRef(null)

    // Handle incoming visit data (Auto-populate all billable items)
    useEffect(() => {
        const loadVisitItems = async () => {
            if (currentVisit && currentVisit.id && loadedVisitIdRef.current !== currentVisit.id) {
                try {
                    // Mark as loaded immediately to prevent race conditions
                    loadedVisitIdRef.current = currentVisit.id;

                    // Fetch all billable items from the visit (drugs, tests, services)
                    const response = await api.get(`/visits/${currentVisit.id}/items`);
                    const visitItems = response.data;

                    // Add all items from the visit if they don't already exist
                    const newItems = visitItems.filter(item => {
                        return !watchedItems.some(existing =>
                            existing.reference_id === item.reference_id &&
                            existing.item_type === item.item_type
                        );
                    }).map(item => ({
                        ...item,
                        is_locked: true
                    }));

                    if (newItems.length > 0) {
                        // Clear default empty item if about to add new ones
                        if (watchedItems.length === 1 && !watchedItems[0].item_name) {
                            remove(0);
                        }
                        append(newItems);
                    }
                } catch (e) {
                    console.error('Failed to load visit items:', e);
                }
            }
        };

        if (currentVisit) {
            loadVisitItems();
        }
    }, [currentVisit]);

    useEffect(() => {
        if (currentPatient) {
            setSelectedPatient(currentPatient);
            setPatientSearch(`${currentPatient.first_name} ${currentPatient.last_name}`);
        }
    }, [currentPatient]);

    const fetchHospitalInfo = async () => {
        try {
            const response = await api.get('/settings/public-config');
            setHospitalInfo(response.data);
        } catch (error) {
            console.error('Failed to fetch hospital info', error);
        }
    };

    useEffect(() => {
        fetchHospitalInfo();
    }, []);

    // Calculate totals
    const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0)
    const total = Math.max(0, subtotal + Number(tax) - Number(discount))

    // Sync payment amount with total
    useEffect(() => {
        setValue('payment.amount', total);
    }, [total, setValue]);

    // Patient Search Effect
    useEffect(() => {
        if (patientSearch.length > 2 && !selectedPatient) {
            const timeoutId = setTimeout(() => {
                dispatch(fetchPatients({ search: patientSearch }))
                setShowPatientResults(true)
            }, 500)
            return () => clearTimeout(timeoutId)
        } else {
            setShowPatientResults(false)
        }
    }, [patientSearch, dispatch, selectedPatient])

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient)
        setValue('patient_id', patient.id)
        setPatientSearch(`${patient.first_name} ${patient.last_name}`)
        setShowPatientResults(false)
    }

    const onSubmit = async (data) => {
        try {
            const invoice = await dispatch(createInvoice({
                ...data,
                invoice_date: data.invoice_date.toISOString(),
                due_date: data.due_date?.toISOString(),
            })).unwrap()

            // If this was tied to a visit, complete the queue session
            if (data.visit_id) {
                await dispatch(completeVisit(data.visit_id)).unwrap()
            }

            toast.success('Invoice created successfully!')
            setCreatedInvoiceId(invoice.id)
            setSavedInvoice(invoice)
            setIsSuccessModalOpen(true)
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
                setDrugs(res.data?.data || res.data || [])
            } else if (type === 'test') {
                const res = await billingService.getLabTests(query)
                setLabTests(res.data?.data || res.data || [])
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

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const blob = await billingService.exportInvoice(createdInvoiceId);
            downloadBlob(blob, `Invoice-${savedInvoice.invoice_number}.pdf`);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download invoice');
        } finally {
            setDownloading(false);
        }
    };

    const handlePrintThermal = () => {
        const printContent = document.getElementById('thermal-receipt-content');
        if (!printContent) {
            toast.error('Thermal receipt content not found');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=350,height=600');
        printWindow.document.write('<html><head><title>Thermal Receipt</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('</head><body class="bg-white">');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    };

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
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block font-outfit uppercase tracking-wider text-[11px] opacity-70">Notes</label>
                        <textarea
                            {...register('notes')}
                            rows="2"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white resize-none"
                            placeholder="Additional comments..."
                        ></textarea>
                    </div>

                    {/* Payment Section */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Details</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Payment Method</label>
                                <select
                                    {...register('payment.payment_method')}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="insurance">Insurance Claim</option>
                                    <option value="card">Credit/Debit Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Amount Paid (KES)</label>
                                <input
                                    type="number" step="0.01"
                                    {...register('payment.amount', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-emerald-600 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Reference / Transaction ID</label>
                                <input
                                    type="text"
                                    {...register('payment.reference_number')}
                                    placeholder="e.g. M-Pesa Code"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Line Items */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" /> Line Items
                        </h2>
                        {!currentVisit && (
                            <button
                                type="button"
                                onClick={() => append({ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, is_locked: false })}
                                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold text-sm flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add Item
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl relative group items-start">
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Type</label>
                                    <select
                                        {...register(`items.${index}.item_type`)}
                                        disabled={watchedItems[index]?.is_locked}
                                        className={`w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-medium shadow-sm outline-none dark:text-white ${watchedItems[index]?.is_locked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="service">Service</option>
                                        <option value="drug">Drug</option>
                                        <option value="test">Lab Test</option>
                                    </select>
                                </div>
                                <div className="col-span-9 sm:col-span-5 relative">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Description</label>
                                    <input
                                        {...register(`items.${index}.item_name`)}
                                        readOnly={watchedItems[index]?.is_locked}
                                        onChange={(e) => {
                                            if (!watchedItems[index]?.is_locked) {
                                                register(`items.${index}.item_name`).onChange(e)
                                                searchCatalog(index, watchedItems[index]?.item_type, e.target.value)
                                            }
                                        }}
                                        className={`w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm shadow-sm outline-none dark:text-white placeholder:text-slate-300 ${watchedItems[index]?.is_locked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        placeholder="Item name..."
                                        autoComplete="off"
                                    />
                                    {/* Catalog Dropdown */}
                                    {activeSearchRow === index && (watchedItems[index]?.item_type === 'drug' || watchedItems[index]?.item_type === 'test') && (
                                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto">
                                            {watchedItems[index]?.item_type === 'drug' && drugs.map((drug) => (
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
                                            {watchedItems[index]?.item_type === 'test' && labTests.map((test) => (
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
                                        readOnly={watchedItems[index]?.is_locked}
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        className={`w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-center shadow-sm outline-none dark:text-white ${watchedItems[index]?.is_locked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Price</label>
                                    <input
                                        type="number" step="0.01"
                                        readOnly={watchedItems[index]?.is_locked}
                                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                        className={`w-full p-2 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-right shadow-sm outline-none dark:text-white ${watchedItems[index]?.is_locked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-1 flex justify-end items-end pt-6">
                                    {!watchedItems[index]?.is_locked && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
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

            <AnimatePresence>
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsSuccessModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invoice Saved Successfully!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Invoice #{savedInvoice?.invoice_number} is ready for processing.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all group"
                                    >
                                        <Printer className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Print A4</span>
                                    </button>

                                    <button
                                        onClick={handlePrintThermal}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all group"
                                    >
                                        <Printer className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Print Thermal</span>
                                    </button>

                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all group"
                                    >
                                        {downloading ? (
                                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-2" />
                                        ) : (
                                            <Download className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                                        )}
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Download PDF</span>
                                    </button>

                                    {currentVisit ? (
                                        <button
                                            onClick={() => {
                                                setIsSuccessModalOpen(false);
                                                setIsTransferOpen(true);
                                            }}
                                            className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-100 dark:border-orange-800 rounded-2xl transition-all group"
                                        >
                                            <ArrowRightLeft className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold text-orange-700 dark:text-orange-400">Transfer Patient</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/billing/invoices/${createdInvoiceId}`)}
                                            className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 rounded-2xl transition-all group"
                                        >
                                            <ArrowLeft className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Close</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex justify-center border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => navigate('/billing')}
                                    className="text-sm font-bold text-slate-500 hover:text-slate-700 underline underline-offset-4"
                                >
                                    Return to Billing Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {currentVisit && (
                <TransferModal
                    isOpen={isTransferOpen}
                    onClose={() => {
                        setIsTransferOpen(false)
                        navigate(`/billing/invoices/${createdInvoiceId}`)
                    }}
                    visitId={currentVisit.id}
                    patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Patient'}
                    onTransferred={() => navigate(`/billing/invoices/${createdInvoiceId}`)}
                />
            )}

            {/* Hidden Thermal Receipt Content */}
            <div className="hidden">
                <div id="thermal-receipt-content">
                    <ThermalReceipt invoice={savedInvoice} hospitalInfo={hospitalInfo} />
                </div>
            </div>
        </div>
    )
}

export default InvoiceForm
