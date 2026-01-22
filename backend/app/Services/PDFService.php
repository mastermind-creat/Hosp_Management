<?php

namespace App\Services;

use TCPDF;

class PDFService
{
    public function generate($title, $content, $filename = 'document.pdf')
    {
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // Set document information
        $pdf->SetCreator('Hospital Manager 2026');
        $pdf->SetAuthor('System Administrator');
        $pdf->SetTitle($title);

        // Set default header data
        $pdf->SetHeaderData('', 0, 'Hospital Manager 2026', "Generated on: " . date('Y-m-d H:i:s'));

        // Set header and footer fonts
        $pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
        $pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

        // Set margins
        $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
        $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
        $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

        // Set auto page breaks
        $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

        // Add a page
        $pdf->AddPage();

        // Set font
        $pdf->SetFont('helvetica', '', 10);

        // Write content
        $pdf->writeHTML($content, true, false, true, false, '');

        // Output PDF
        return $pdf->Output($filename, 'S'); // Return as string
    }

    public function getInvoiceHtml($invoice)
    {
        $settings = \Illuminate\Support\Facades\DB::table('settings')->pluck('value', 'key');
        $hospitalName = $settings['hospital_name'] ?? 'City General Hospital';
        $hospitalAddress = $settings['hospital_address'] ?? '123 Medical Plaza, Nairobi, Kenya';
        $hospitalPhone = $settings['hospital_phone'] ?? '+254 700 000 000';
        $hospitalWebsite = $settings['hospital_website'] ?? 'www.cityhospital.com';
        $currency = $settings['currency_symbol'] ?? 'Ksh.';

        $itemsHtml = '';
        foreach ($invoice->items as $item) {
            $itemsHtml .= "
                <tr class=\"item\">
                    <td style=\"padding: 10px; border-bottom: 1px solid #eee;\">{$item->item_name}<br><small style=\"color: #666;\">{$item->item_type}</small></td>
                    <td style=\"padding: 10px; border-bottom: 1px solid #eee;\" align=\"center\">{$item->quantity}</td>
                    <td style=\"padding: 10px; border-bottom: 1px solid #eee;\" align=\"right\">" . number_format($item->unit_price, 2) . "</td>
                    <td style=\"padding: 10px; border-bottom: 1px solid #eee;\" align=\"right\">" . number_format($item->total_price, 2) . "</td>
                </tr>";
        }

        return "
        <style>
            .invoice-box {
                max-width: 800px;
                margin: auto;
                padding: 30px;
                font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                color: #555;
            }
            .header {
                border-bottom: 2px solid #4f46e5;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .title {
                color: #4f46e5;
                font-size: 28px;
                font-weight: bold;
            }
            .hospital-info {
                text-align: right;
                font-size: 12px;
                color: #666;
            }
            .details-table {
                width: 100%;
                margin-bottom: 20px;
            }
            .details-table td {
                vertical-align: top;
            }
            .bill-to {
                font-size: 14px;
            }
            .invoice-meta {
                text-align: right;
                font-size: 14px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
            }
            .items-table th {
                background-color: #4f46e5;
                color: #ffffff;
                padding: 10px;
                text-align: left;
                font-size: 12px;
                text-transform: uppercase;
            }
            .summary-table {
                width: 300px;
                margin-left: auto;
                margin-top: 20px;
                font-size: 14px;
            }
            .summary-table td {
                padding: 5px 0;
            }
            .total-row {
                border-top: 2px solid #4f46e5;
                font-weight: bold;
                color: #4f46e5;
                font-size: 18px;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 10px;
                color: #999;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
        </style>

        <div class=\"invoice-box\">
            <table class=\"header\" width=\"100%\">
                <tr>
                    <td class=\"title\">{$hospitalName}</td>
                    <td class=\"hospital-info\">
                        {$hospitalAddress}<br>
                        Phone: {$hospitalPhone}<br>
                        Web: {$hospitalWebsite}
                    </td>
                </tr>
            </table>

            <table class=\"details-table\" width=\"100%\">
                <tr>
                    <td class=\"bill-to\">
                        <strong style=\"color: #4f46e5;\">BILL TO:</strong><br>
                        <strong>Patient:</strong> {$invoice->patient->first_name} {$invoice->patient->last_name}<br>
                        <strong>Patient ID:</strong> {$invoice->patient->patient_number}<br>
                        <strong>Phone:</strong> {$invoice->patient->phone}
                    </td>
                    <td class=\"invoice-meta\">
                        <strong style=\"color: #4f46e5; font-size: 20px;\">INVOICE</strong><br>
                        <strong>Invoice #:</strong> {$invoice->invoice_number}<br>
                        <strong>Date:</strong> {$invoice->invoice_date->format('d M, Y')}<br>
                        <strong>Due Date:</strong> {$invoice->due_date->format('d M, Y')}<br>
                        <strong>Status:</strong> <span style=\"text-transform: uppercase;\">{$invoice->status}</span>
                    </td>
                </tr>
            </table>

            <table class=\"items-table\">
                <thead>
                    <tr>
                        <th width=\"50%\">Service Description</th>
                        <th width=\"10%\" align=\"center\">Qty</th>
                        <th width=\"20%\" align=\"right\">Unit Price</th>
                        <th width=\"20%\" align=\"right\">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
            </table>

            <table class=\"summary-table\">
                <tr>
                    <td>Subtotal</td>
                    <td align=\"right\">{$currency} " . number_format($invoice->subtotal, 2) . "</td>
                </tr>
                <tr>
                    <td>Tax</td>
                    <td align=\"right\">{$currency} " . number_format($invoice->tax_amount, 2) . "</td>
                </tr>
                <tr>
                    <td>Discount</td>
                    <td align=\"right\">- {$currency} " . number_format($invoice->discount_amount, 2) . "</td>
                </tr>
                <tr class=\"total-row\">
                    <td style=\"padding-top: 10px;\">Total Amount</td>
                    <td style=\"padding-top: 10px;\" align=\"right\">{$currency} " . number_format($invoice->total_amount, 2) . "</td>
                </tr>
                <tr>
                    <td>Amount Paid</td>
                    <td align=\"right\">{$currency} " . number_format($invoice->paid_amount, 2) . "</td>
                </tr>
                <tr style=\"font-weight: bold; color: " . ($invoice->balance > 0 ? '#e11d48' : '#059669') . ";\">
                    <td>Balance Due</td>
                    <td align=\"right\">{$currency} " . number_format($invoice->balance, 2) . "</td>
                </tr>
            </table>

            <div class=\"footer\">
                <p>This is a computer generated invoice and does not require a signature.</p>
                <p>Thank you for choosing {$hospitalName} for your healthcare needs.</p>
                <p><strong>Payment Terms:</strong> Please settle all outstanding balances within the due date to avoid service interruptions.</p>
            </div>
        </div>
        ";
    }
}
