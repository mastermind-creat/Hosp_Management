<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\DailySummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected $invoiceService;

    public function __construct(\App\Services\InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,mobile_money,insurance,bank_transfer',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $payment = $this->invoiceService->recordPayment($validated['invoice_id'], $validated);
            return response()->json($payment, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function dailySummary(Request $request)
    {
        $date = $request->get('date', now()->toDateString());
        
        $payments = Payment::whereDate('payment_date', $date)
            ->whereNull('voided_at')
            ->get();

        $summary = [
            'summary_date' => $date,
            'cash_amount' => $payments->where('payment_method', 'cash')->sum('amount'),
            'card_amount' => $payments->where('payment_method', 'card')->sum('amount'),
            'mobile_money_amount' => $payments->where('payment_method', 'mobile_money')->sum('amount'),
            'insurance_amount' => $payments->where('payment_method', 'insurance')->sum('amount'),
            'bank_transfer_amount' => $payments->where('payment_method', 'bank_transfer')->sum('amount'),
            'total_amount' => $payments->sum('amount'),
            'transaction_count' => $payments->count(),
        ];

        return response()->json($summary);
    }

    public function generateZReport(Request $request)
    {
        $date = $request->get('date', now()->toDateString());
        
        return DB::transaction(function () use ($date) {
            $existing = DailySummary::where('summary_date', $date)->first();
            if ($existing) {
                return response()->json(['error' => 'Z-Report already generated for this date'], 422);
            }

            $summaryData = json_decode($this->dailySummary(new Request(['date' => $date]))->getContent(), true);
            
            $report = DailySummary::create(array_merge($summaryData, [
                'generated_by' => auth()->id(),
            ]));

            return response()->json($report, 201);
        });
    }
}
