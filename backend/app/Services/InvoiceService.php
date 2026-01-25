<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InvoiceService
{
    protected $pharmacyService;

    public function __construct(\App\Services\PharmacyService $pharmacyService)
    {
        $this->pharmacyService = $pharmacyService;
    }

    /**
     * Get all billable items from a visit (drugs, tests, services)
     */
    public function getVisitItems(string $visitId): array
    {
        $visit = \App\Models\PatientVisit::with(['prescriptions.items.drug', 'testRequests.test', 'visitServices.service'])->findOrFail($visitId);
        $items = [];

        // Use a keyed array to group items
        $groupedItems = [];

        // Add prescribed drugs
        if ($visit->prescriptions) {
            foreach ($visit->prescriptions as $prescription) {
                foreach ($prescription->items as $rxItem) {
                    $drug = $rxItem->drug;
                    if ($drug) {
                        $key = "drug_{$drug->id}";
                        if (!isset($groupedItems[$key])) {
                            $groupedItems[$key] = [
                                'item_type' => 'drug',
                                'item_name' => "{$drug->generic_name} ({$rxItem->dosage})",
                                'reference_id' => $drug->id,
                                'quantity' => 0,
                                'unit_price' => (float)$drug->unit_price,
                            ];
                        }
                        $groupedItems[$key]['quantity'] += (int)$rxItem->quantity;
                    }
                }
            }
        }

        // Add lab tests
        if ($visit->testRequests) {
            foreach ($visit->testRequests as $testRequest) {
                if ($testRequest->test) {
                    $key = "test_{$testRequest->test->id}";
                    if (!isset($groupedItems[$key])) {
                        $groupedItems[$key] = [
                            'item_type' => 'test',
                            'item_name' => $testRequest->test->test_name,
                            'reference_id' => $testRequest->test->id,
                            'quantity' => 0,
                            'unit_price' => (float)($testRequest->test->price ?? 0),
                        ];
                    }
                    $groupedItems[$key]['quantity'] += 1;
                }
            }
        }

        // Add services
        if ($visit->visitServices) {
            foreach ($visit->visitServices as $visitService) {
                if ($visitService->service) {
                    $key = "service_{$visitService->service->id}";
                    if (!isset($groupedItems[$key])) {
                        $groupedItems[$key] = [
                            'item_type' => 'service',
                            'item_name' => $visitService->service->name,
                            'reference_id' => $visitService->service->id,
                            'quantity' => 0,
                            'unit_price' => (float)$visitService->unit_price,
                        ];
                    }
                    $groupedItems[$key]['quantity'] += (int)$visitService->quantity;
                }
            }
        }

        return array_values($groupedItems);
    }

    /**
     * Create a new invoice with items
     */
    public function createInvoice(array $data, array $items)
    {
        return DB::transaction(function () use ($data, $items) {
            $invoice = Invoice::create([
                'id' => (string) Str::uuid(),
                'invoice_number' => $this->generateInvoiceNumber(),
                'patient_id' => $data['patient_id'],
                'visit_id' => $data['visit_id'] ?? null,
                'invoice_date' => $data['invoice_date'] ?? now(),
                'due_date' => $data['due_date'] ?? now()->addDays(7),
                'status' => 'pending',
                'created_by' => auth()->id(),
                'notes' => $data['notes'] ?? null,
            ]);

            $subtotal = 0;
            foreach ($items as $item) {
                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;

                InvoiceItem::create([
                    'id' => (string) Str::uuid(),
                    'invoice_id' => $invoice->id,
                    'item_type' => $item['item_type'],
                    'item_name' => $item['item_name'],
                    'reference_id' => $item['reference_id'] ?? null,
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $totalPrice,
                ]);

                // Auto-deduct stock if it's a drug
                if ($item['item_type'] === 'drug' && !empty($item['reference_id'])) {
                    $this->pharmacyService->dispense([
                        'patient_id' => $invoice->patient_id,
                        'drug_id' => $item['reference_id'],
                        'quantity' => $item['quantity'],
                        'invoice_id' => $invoice->id,
                        'prescription_id' => null,
                    ]);
                }
            }

            $invoice->subtotal = $subtotal;
            $invoice->tax_amount = $data['tax_amount'] ?? 0;
            $invoice->discount_amount = $data['discount_amount'] ?? 0;
            
            $invoice->total_amount = max(0, $subtotal + $invoice->tax_amount - $invoice->discount_amount);
            $invoice->balance = $invoice->total_amount;
            $invoice->save();

            // Integrated Payment Recording
            if (!empty($data['payment']) && isset($data['payment']['amount']) && $data['payment']['amount'] > 0) {
                $this->recordPayment($invoice->id, $data['payment']);
            }

            return $invoice->load(['items', 'payments', 'patient', 'creator']);
        });
    }

    /**
     * Process a payment for an invoice
     */
    public function recordPayment(string $invoiceId, array $paymentData)
    {
        return DB::transaction(function () use ($invoiceId, $paymentData) {
            $invoice = Invoice::findOrFail($invoiceId);
            
            $payment = Payment::create([
                'id' => (string) Str::uuid(),
                'payment_number' => $this->generatePaymentNumber(),
                'invoice_id' => $invoice->id,
                'patient_id' => $invoice->patient_id,
                'payment_date' => $paymentData['payment_date'] ?? now(),
                'amount' => $paymentData['amount'],
                'payment_method' => $paymentData['payment_method'],
                'reference_number' => $paymentData['reference_number'] ?? null,
                'notes' => $paymentData['notes'] ?? null,
                'received_by' => auth()->id(),
            ]);

            $invoice->paid_amount += $payment->amount;
            $invoice->balance = $invoice->total_amount - $invoice->paid_amount;

            if ($invoice->balance <= 0) {
                $invoice->status = 'paid';
            } elseif ($invoice->paid_amount > 0) {
                $invoice->status = 'partial';
            }

            $invoice->save();

            return $payment;
        });
    }

    /**
     * Generate unique invoice number
     */
    private function generateInvoiceNumber()
    {
        $prefix = 'INV-' . date('Ymd');
        $count = Invoice::whereDate('created_at', Carbon::today())->count() + 1;
        return $prefix . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate unique payment number
     */
    private function generatePaymentNumber()
    {
        $prefix = 'PAY-' . date('Ymd');
        $count = Payment::whereDate('created_at', Carbon::today())->count() + 1;
        return $prefix . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
