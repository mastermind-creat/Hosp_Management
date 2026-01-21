import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle, CreditCard } from 'lucide-react';

const InvoiceDetail = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link to="/billing" className="flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
                </Link>
                <div className="flex gap-2">
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </button>
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                        <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <div className="text-center py-20">
                    <h2 className="text-xl font-bold dark:text-white">Invoice Detail Component for {id}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Implementation in progress...</p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
