<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    protected $invoiceService;

    public function __construct(\App\Services\InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request)
    {
        $query = Invoice::with(['patient', 'creator']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate($request->get('limit', 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'visit_id' => 'nullable|exists:patient_visits,id',
            'due_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|string',
            'items.*.item_name' => 'required|string',
            'items.*.reference_id' => 'nullable|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'payment' => 'nullable|array',
            'payment.amount' => 'required_with:payment|numeric|min:0',
            'payment.payment_method' => 'required_with:payment|string',
            'payment.reference_number' => 'nullable|string',
        ]);

        try {
            $invoice = $this->invoiceService->createInvoice($validated, $validated['items']);
            return response()->json($invoice, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return Invoice::with(['patient', 'items', 'payments', 'creator'])->findOrFail($id);
    }

    public function void(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        if ($invoice->status === 'paid') {
            return response()->json(['error' => 'Cannot void a fully paid invoice'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $invoice->update([
            'status' => 'cancelled',
            'voided_by' => auth()->id(),
            'voided_at' => now(),
            'void_reason' => $validated['reason'],
        ]);

        return response()->json($invoice);
    }

    public function getVisitItems(Request $request, $visitId)
    {
        return response()->json($this->invoiceService->getVisitItems($visitId));
    }
}
