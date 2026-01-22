import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, Printer, CheckCircle,
    CreditCard, FileText, User, Calendar,
    AlertCircle, Clock, Check, Building2, Phone, Globe
} from 'lucide-react';
import billingService from '../../services/billingService';
import api from '../../services/api';
import { formatKES } from '../../utils/format';
import { format } from 'date-fns';
import { downloadBlob } from '../../utils/download';
import { toast } from 'react-hot-toast';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [hospitalInfo, setHospitalInfo] = useState(null);

    useEffect(() => {
        fetchInvoice();
        fetchHospitalInfo();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const data = await billingService.getInvoiceById(id);
            setInvoice(data);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Failed to load invoice details');
        } finally {
            setLoading(false);
        }
    };

    const fetchHospitalInfo = async () => {
        try {
            const response = await api.get('/settings/public-config');
            setHospitalInfo(response.data);
        } catch (error) {
            console.error('Failed to fetch hospital info', error);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const blob = await billingService.exportInvoice(id);
            downloadBlob(blob, `Invoice-${invoice.invoice_number}.pdf`);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download invoice');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice not found</h2>
                <Link to="/billing" className="text-indigo-600 mt-4 inline-block font-semibold">Back to Invoices</Link>
            </div>
        );
    }

    const getStatusInfo = (status) => {
        switch (status) {
            case 'paid':
                return { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle };
            case 'partial':
                return { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400', icon: Clock };
            default:
                return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', icon: FileText };
        }
    };

    const StatusIcon = getStatusInfo(invoice.status).icon;

    return (
        <div className="space-y-6">
            {/* Action Bar - Hidden on print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <Link to="/billing" className="flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
                </Link>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50"
                    >
                        {downloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Download PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                        <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                    </button>
                </div>
            </div>

            {/* Print Header - Only visible on print */}
            <div className="hidden print:flex flex-col space-y-4 mb-8 border-b-2 border-indigo-600 pb-6 items-center text-center">
                <h1 className="text-3xl font-black text-slate-900 border-b-4 border-indigo-600 pb-2 mb-2">
                    {hospitalInfo?.hospital_name || 'City General Hospital'}
                </h1>
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600 uppercase tracking-widest">
                    <span className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-indigo-600" /> {hospitalInfo?.hospital_address}</span>
                    <span className="flex items-center"><Phone className="w-4 h-4 mr-2 text-indigo-600" /> {hospitalInfo?.hospital_phone}</span>
                    <span className="flex items-center"><Globe className="w-4 h-4 mr-2 text-indigo-600" /> {hospitalInfo?.hospital_website}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6 print:w-full print:block">
                    {/* Invoice Content */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none print:w-full">
                        <div className="p-8 border-b border-slate-200 dark:border-slate-800 print:bg-slate-50/50 print:border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white print:text-3xl">Invoice</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-lg">#{invoice.invoice_number}</p>
                                    <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize no-print ${getStatusInfo(invoice.status).color}`}>
                                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                                        {invoice.status}
                                    </div>
                                    <div className="hidden print:block mt-4 text-sm font-bold uppercase text-indigo-600 tracking-wider">
                                        Status: {invoice.status}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Issued</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</p>
                                        <p className="font-bold text-rose-600 dark:text-rose-400">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 print:gap-24">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Patient Information</h3>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl no-print">
                                            <User className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{invoice.patient?.first_name} {invoice.patient?.last_name}</p>
                                            <div className="space-y-1 mt-2 text-sm text-slate-600">
                                                <p><span className="font-semibold">ID:</span> {invoice.patient?.patient_number}</p>
                                                <p><span className="font-semibold">Phone:</span> {invoice.patient?.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Account Management</h3>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl no-print">
                                            <Check className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{invoice.creator?.name}</p>
                                            <div className="space-y-1 mt-2 text-sm text-slate-600">
                                                <p><span className="font-semibold">Staff:</span> {invoice.creator?.email}</p>
                                                <p className="text-xs uppercase tracking-tighter">Authorized signature not required</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900 dark:border-slate-800 print:bg-slate-100">
                                            <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Service/Item</th>
                                            <th className="py-4 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center">Qty</th>
                                            <th className="py-4 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Unit Price</th>
                                            <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {invoice.items?.map((item, idx) => (
                                            <tr key={idx} className="print:break-inside-avoid">
                                                <td className="py-5">
                                                    <p className="font-bold text-slate-900 dark:text-white">{item.item_name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.item_type}</p>
                                                </td>
                                                <td className="py-5 px-4 text-center font-medium dark:text-slate-300">{item.quantity}</td>
                                                <td className="py-5 px-4 text-right font-medium dark:text-slate-300">{formatKES(item.unit_price)}</td>
                                                <td className="py-5 text-right font-bold text-slate-900 dark:text-white">{formatKES(item.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <div className="w-full md:w-80 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                        <span className="font-semibold dark:text-slate-300">{formatKES(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Tax</span>
                                        <span className="font-semibold dark:text-slate-300">{formatKES(invoice.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Discount</span>
                                        <span className="font-semibold text-emerald-600">-{formatKES(invoice.discount_amount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t-2 border-slate-200 dark:border-slate-800">
                                        <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatKES(invoice.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                                        <span className="font-bold text-slate-900 dark:text-white">Amount Paid</span>
                                        <span className="font-bold dark:text-slate-300">{formatKES(invoice.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border-t-2 border-slate-900">
                                        <span className="font-bold text-slate-900 dark:text-white">Balance Due</span>
                                        <span className={`text-xl font-black ${invoice.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatKES(invoice.balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden print:block mt-12 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400">
                                <p>Thank you for choosing {hospitalInfo?.hospital_name} - This is a computer generated invoice.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 no-print">
                    {/* Payment History - Hidden on print by no-print or by being in the 3rd col which we might want to hide entirely */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Payment History</h3>
                        <div className="space-y-6">
                            {invoice.payments?.length > 0 ? (
                                invoice.payments.map((payment, idx) => (
                                    <div key={payment.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 pb-2 last:pb-0">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                        <div className="flex justify-between mb-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatKES(payment.amount)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(payment.payment_date), 'dd MMM')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{payment.payment_method}</span>
                                            <span className="text-[10px] py-0.5 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-medium">#{payment.payment_number}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-500 italic">No payments recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white overflow-hidden relative group">
                        <div className="relative z-10 text-center">
                            <h4 className="font-bold mb-2">Need Help?</h4>
                            <p className="text-indigo-100 text-sm mb-4">Contact our billing department for any item disputes.</p>
                            <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                                Contact Billing
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
