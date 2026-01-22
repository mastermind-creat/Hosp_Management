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
        $today = now()->toDateString();
        
        // 1. Core Summary Stats
        $stats = [
            'total_patients' => Patient::count(),
            // Loosen appointment check to include all pending future appointments
            'active_appointments' => \App\Models\Appointment::where('status', 'pending')
                ->where('appointment_date', '>=', $today) 
                ->count(),
            'revenue_today' => (float) Payment::whereDate('payment_date', $today)->sum('amount'), // Ensure float
            'online_staff' => \App\Models\User::where('last_login_at', '>=', now()->subHours(1))->count(),
        ];

        // 2. Weekly Revenue Analysis (Last 7 Days)
        $revenueAnalysis = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $date->format('D');
            $amount = Payment::whereDate('payment_date', $date->toDateString())->sum('amount');
            $patientCount = \App\Models\PatientVisit::whereDate('visit_date', $date->toDateString())->count();
            
            $revenueAnalysis[] = [
                'name' => $dayName,
                'revenue' => (float)$amount,
                'patients' => $patientCount
            ];
        }

        // 3. Recent Activity (Latest 5 Visits)
        $recentActivity = \App\Models\PatientVisit::with('patient')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($visit) {
                return [
                    'name' => $visit->patient->first_name . ' ' . $visit->patient->last_name,
                    'time' => $visit->visit_date->format('h:i A'),
                    'type' => strtoupper($visit->visit_type),
                    'status' => $visit->status,
                    'color' => $this->getActivityColor($visit->visit_type)
                ];
            });

        return response()->json([
            'success' => true,
            'data' => array_merge($stats, [
                'revenue_analysis' => $revenueAnalysis,
                'recent_activity' => $recentActivity
            ])
        ]);
    }

    private function getActivityColor($type)
    {
        return match (strtolower($type)) {
            'opd' => 'bg-blue-500',
            'ipd' => 'bg-emerald-500',
            'emergency' => 'bg-red-500',
            default => 'bg-slate-500',
        };
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
