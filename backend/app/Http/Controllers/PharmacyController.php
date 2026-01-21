<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugDispensing;
use App\Models\StockAdjustment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PharmacyController extends Controller
{
    protected $pharmacyService;

    public function __construct(\App\Services\PharmacyService $pharmacyService)
    {
        $this->pharmacyService = $pharmacyService;
    }

    public function index(Request $request)
    {
        $query = Drug::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        return $query->with('batches')->paginate($request->get('limit', 15));
    }

    public function storeDrug(Request $request)
    {
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'strength' => 'nullable|string',
            'form' => 'nullable|string',
            'category' => 'nullable|string',
            'unit_price' => 'required|numeric|min:0',
            'reorder_level' => 'nullable|integer',
        ]);

        $drug = Drug::create($validated);
        return response()->json($drug, 201);
    }

    public function addStock(Request $request, $drugId)
    {
        $validated = $request->validate([
            'batch_number' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
            'expiry_date' => 'required|date|after:today',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $batch = $this->pharmacyService->addStock($drugId, $validated);
        return response()->json($batch, 201);
    }

    public function dispense(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'prescription_id' => 'nullable|exists:prescriptions,id',
            'drug_id' => 'required|exists:drugs,id',
            'quantity' => 'required|integer|min:1',
            'invoice_id' => 'nullable|exists:invoices,id',
        ]);

        try {
            $dispensing = $this->pharmacyService->dispense($validated);
            return response()->json($dispensing, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function stockAlerts()
    {
        return response()->json($this->pharmacyService->getStockAlerts());
    }
}
