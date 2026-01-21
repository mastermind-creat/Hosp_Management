<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Patient;
use App\Models\DrugDispensing;
use App\Models\TestRequest;
use App\Models\Invoice;
use App\Services\PDFService;
use App\Services\ExcelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    protected $pdf;
    protected $excel;

    public function __construct(PDFService $pdf, ExcelService $excel)
    {
        $this->pdf = $pdf;
        $this->excel = $excel;
    }

    public function revenueReport(Request $request)
    {
        $date = $request->get('date', now()->toDateString());
        
        $payments = Payment::whereDate('payment_date', $date)
            ->with(['patient', 'invoice'])
            ->get();

        if ($request->get('export') === 'pdf') {
            $html = "<h1>Revenue Report for {$date}</h1>";
            $html .= "<table border='1' cellpadding='5'><tr><th>Time</th><th>Patient</th><th>Invoice</th><th>Method</th><th>Amount</th></tr>";
            foreach ($payments as $p) {
                $html .= "<tr><td>{$p->payment_date->format('H:i')}</td><td>{$p->patient->name}</td><td>{$p->invoice->invoice_number}</td><td>{$p->payment_method}</td><td>{$p->amount}</td></tr>";
            }
            $html .= "</table><p><strong>Total: " . $payments->sum('amount') . "</strong></p>";
            
            $pdfContent = $this->pdf->generate("Revenue Report {$date}", $html);
            return Response::make($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "attachment; filename=revenue-{$date}.pdf"
            ]);
        }

        return response()->json($payments);
    }

    public function dashboardStats()
    {
        return response()->json([
            'patients_total' => Patient::count(),
            'visits_today' => \App\Models\PatientVisit::whereDate('visit_date', now()->toDateString())->count(),
            'revenue_today' => Payment::whereDate('payment_date', now()->toDateString())->sum('amount'),
            'pending_lab' => TestRequest::where('status', 'pending')->count(),
            'low_stock_drugs' => \App\Models\Drug::all()->filter(function($d) {
                return $d->totalStock() <= $d->reorder_level;
            })->count()
        ]);
    }

    public function exportInvoice($id)
    {
        $invoice = Invoice::with(['patient', 'items', 'creator'])->findOrFail($id);
        $html = $this->pdf->getInvoiceHtml($invoice);
        
        $pdfContent = $this->pdf->generate("Invoice {$invoice->invoice_number}", $html);
        return Response::make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=invoice-{$invoice->invoice_number}.pdf"
        ]);
    }
}
