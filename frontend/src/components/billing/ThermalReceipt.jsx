import React from 'react';
import { format } from 'date-fns';
import { formatKES } from '../../utils/format';

const ThermalReceipt = ({ invoice, hospitalInfo }) => {
    if (!invoice) return null;

    const safeDateFormat = (dateStr) => {
        try {
            if (!dateStr) return 'N/A';
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj.getTime())) return 'Invalid Date';
            return format(dateObj, 'dd/MM/yyyy HH:mm');
        } catch (e) {
            return 'Date Error';
        }
    };

    return (
        <div id="thermal-receipt-content" className="w-[80mm] p-2 bg-white text-black font-mono text-[12px] leading-tight">
            <div className="text-center space-y-1 mb-4">
                <h1 className="text-[16px] font-bold uppercase">{hospitalInfo?.hospital_name?.value || hospitalInfo?.hospital_name || 'HOSPITAL MANAGER'}</h1>
                <p>{hospitalInfo?.hospital_address?.value || hospitalInfo?.hospital_address}</p>
                <p>Tel: {hospitalInfo?.hospital_phone?.value || hospitalInfo?.hospital_phone}</p>
                <div className="border-b border-dashed border-black pb-2 mb-2"></div>
                <p className="font-bold">OFFICIAL RECEIPT</p>
                <p>No: {invoice.invoice_number}</p>
                <p>Date: {safeDateFormat(invoice.invoice_date)}</p>
            </div>

            <div className="space-y-1 mb-4">
                <p><span className="font-bold">Patient:</span> {invoice.patient?.first_name} {invoice.patient?.last_name}</p>
                <p><span className="font-bold">ID:</span> {invoice.patient?.patient_number || 'N/A'}</p>
                <div className="border-b border-dashed border-black py-1 mb-1"></div>
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="text-left border-b border-dashed border-black">
                        <th className="py-1">Description</th>
                        <th className="py-1 text-right">Amt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-black/30">
                    {invoice.items?.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-1">
                                {item.item_name}
                                <br />
                                <span className="text-[10px] italic">({item.quantity} x {formatKES(item.unit_price)})</span>
                            </td>
                            <td className="py-1 text-right">{formatKES(item.total_price)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="space-y-1 border-t border-dashed border-black pt-2">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatKES(invoice.subtotal)}</span>
                </div>
                {Number(invoice.tax_amount) > 0 && (
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatKES(invoice.tax_amount)}</span>
                    </div>
                )}
                {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="text-red-600">-{formatKES(invoice.discount_amount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-black text-[14px] mt-2 mb-2 border-y border-double border-black py-1 uppercase">
                    <span>Total:</span>
                    <span>{formatKES(invoice.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Paid:</span>
                    <span>{formatKES(invoice.paid_amount || 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Balance:</span>
                    <span>{formatKES(invoice.balance || 0)}</span>
                </div>
            </div>

            <div className="text-center mt-6 space-y-2 border-t border-dashed border-black pt-4">
                <p className="text-[10px] uppercase text-black/50">Thank you for choosing us</p>
                <p className="text-[10px]">Served by: {invoice.creator?.name || 'Receptionist'}</p>
                <p className="text-[10px] font-bold">Quick Recovery!</p>
                <div className="flex justify-center py-2">
                    <div className="w-20 h-20 bg-slate-100 flex items-center justify-center border border-black/20 p-1 rounded">
                        <span className="text-[8px] text-center opacity-30 uppercase font-bold tracking-tighter">QR Code<br />Verification</span>
                    </div>
                </div>
                <p className="text-[8px] italic opacity-30">Powered by Antigravity Hospital Manager</p>
                <p className="mt-2 tracking-widest opacity-20">********************************</p>
            </div>
        </div>
    );
};

export default ThermalReceipt;
