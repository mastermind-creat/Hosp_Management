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
        $itemsHtml = '';
        foreach ($invoice->items as $item) {
            $itemsHtml .= "<tr>
                <td>{$item->item_name}</td>
                <td>{$item->quantity}</td>
                <td>Ksh. " . number_format($item->unit_price, 2) . "</td>
                <td>Ksh. " . number_format($item->total_price, 2) . "</td>
            </tr>";
        }

        return "
            <h1>Invoice: {$invoice->invoice_number}</h1>
            <p>Patient: {$invoice->patient->first_name} {$invoice->patient->last_name}</p>
            <p>Date: {$invoice->invoice_date->format('Y-m-d')}</p>
            <table border=\"1\" cellpadding=\"5\">
                <thead>
                    <tr style=\"background-color:#f2f2f2;\">
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan=\"3\" align=\"right\"><strong>Subtotal:</strong></td>
                        <td>Ksh. " . number_format($invoice->subtotal, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan=\"3\" align=\"right\"><strong>Tax:</strong></td>
                        <td>Ksh. " . number_format($invoice->tax_amount, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan=\"3\" align=\"right\"><strong>Discount:</strong></td>
                        <td>Ksh. " . number_format($invoice->discount_amount, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan=\"3\" align=\"right\"><strong>Grand Total:</strong></td>
                        <td><strong>Ksh. " . number_format($invoice->total_amount, 2) . "</strong></td>
                    </tr>
                </tfoot>
            </table>
        ";
    }
}
