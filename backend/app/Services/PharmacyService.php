<?php

namespace App\Services;

use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugDispensing;
use Illuminate\Support\Facades\DB;

class PharmacyService
{
    /**
     * Add stock to a drug
     */
    public function addStock($drugId, array $data)
    {
        return DB::transaction(function () use ($drugId, $data) {
            $drug = Drug::findOrFail($drugId);

            return DrugBatch::create([
                'drug_id' => $drug->id,
                'batch_number' => $data['batch_number'],
                'quantity_received' => $data['quantity'],
                'quantity_remaining' => $data['quantity'],
                'unit_cost' => $data['unit_cost'],
                'expiry_date' => $data['expiry_date'],
                'supplier_id' => $data['supplier_id'] ?? null,
                'received_by' => auth()->id(),
                'received_at' => now(),
            ]);
        });
    }

    /**
     * Dispense a drug to a patient
     */
    public function dispense(array $data)
    {
        return DB::transaction(function () use ($data) {
            $drug = Drug::findOrFail($data['drug_id']);
            
            // Find batches with enough stock, ordered by expiry date (FEFO)
            $batch = DrugBatch::where('drug_id', $drug->id)
                ->where('quantity_remaining', '>=', $data['quantity'])
                ->where('expiry_date', '>', now())
                ->orderBy('expiry_date', 'asc')
                ->first();

            if (!$batch) {
                throw new \Exception("Insufficient stock or expired drugs for {$drug->brand_name} ({$drug->generic_name})");
            }

            $dispensing = DrugDispensing::create([
                'patient_id' => $data['patient_id'],
                'prescription_id' => $data['prescription_id'] ?? null,
                'drug_id' => $drug->id,
                'batch_id' => $batch->id,
                'quantity' => $data['quantity'],
                'unit_price' => $drug->unit_price,
                'total_price' => $drug->unit_price * $data['quantity'],
                'dispensed_by' => auth()->id(),
                'dispensed_at' => now(),
                'invoice_id' => $data['invoice_id'] ?? null,
            ]);

            // Deduct stock
            $batch->decrement('quantity_remaining', $data['quantity']);

            return $dispensing;
        });
    }

    /**
     * Get stock alerts
     */
    public function getStockAlerts()
    {
        $lowStock = Drug::all()->filter(function($drug) {
            return $drug->totalStock() <= $drug->reorder_level;
        })->values();

        $expiring = DrugBatch::where('expiry_date', '<=', now()->addMonths(3))
            ->where('quantity_remaining', '>', 0)
            ->with('drug')
            ->get();

        return [
            'low_stock' => $lowStock,
            'expiring_soon' => $expiring
        ];
    }
}
