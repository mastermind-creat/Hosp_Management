<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use App\Models\TestRequest;
use App\Models\SampleCollection;
use App\Models\TestResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabController extends Controller
{
    public function index(Request $request)
    {
        $query = LabTest::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('test_name', 'like', "%{$search}%")
                  ->orWhere('test_code', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        return $query->paginate($request->get('limit', 15));
    }

    public function storeTest(Request $request)
    {
        $validated = $request->validate([
            'test_code' => 'required|string|unique:lab_tests',
            'test_name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sample_type' => 'nullable|string',
            'normal_range' => 'nullable|string',
        ]);

        $test = LabTest::create($validated);
        return response()->json($test, 201);
    }

    public function requests(Request $request)
    {
        $query = TestRequest::with(['patient', 'test', 'requester', 'sample', 'result']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate($request->get('limit', 15));
    }

    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'visit_id' => 'nullable|exists:patient_visits,id',
            'test_id' => 'required|exists:lab_tests,id',
            'priority' => 'required|in:routine,urgent,stat',
            'clinical_notes' => 'nullable|string',
        ]);

        $testRequest = TestRequest::create(array_merge($validated, [
            'request_number' => 'LAB-' . strtoupper(Str::random(10)),
            'request_date' => now(),
            'requested_by' => auth()->id(),
            'status' => 'pending',
        ]));

        return response()->json($testRequest, 201);
    }

    public function collectSample(Request $request, $requestId)
    {
        $labRequest = TestRequest::findOrFail($requestId);

        if ($labRequest->status !== 'pending') {
            return response()->json(['error' => 'Sample already collected or request cancelled'], 422);
        }

        $validated = $request->validate([
            'collection_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($labRequest, $validated) {
            SampleCollection::create([
                'request_id' => $labRequest->id,
                'sample_id' => 'SMP-' . strtoupper(Str::random(8)),
                'collection_date' => now(),
                'collected_by' => auth()->id(),
                'collection_notes' => $validated['collection_notes'] ?? null,
            ]);

            $labRequest->update(['status' => 'sample_collected']);

            return response()->json($labRequest->load('sample'));
        });
    }

    public function enterResult(Request $request, $requestId)
    {
        $labRequest = TestRequest::findOrFail($requestId);

        if ($labRequest->status !== 'sample_collected' && $labRequest->status !== 'in_progress') {
            return response()->json(['error' => 'Sample must be collected before entering results'], 422);
        }

        $validated = $request->validate([
            'result_value' => 'required|string',
            'unit' => 'nullable|string',
            'interpretation' => 'nullable|string',
            'is_abnormal' => 'required|boolean',
            'technician_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($labRequest, $validated) {
            $result = TestResult::updateOrCreate(
                ['request_id' => $labRequest->id],
                array_merge($validated, [
                    'entered_by' => auth()->id(),
                    'result_date' => now(),
                ])
            );

            $labRequest->update(['status' => 'completed']);

            return response()->json($result);
        });
    }

    public function verifyResult(Request $request, $requestId)
    {
        $labRequest = TestRequest::findOrFail($requestId);
        
        if ($labRequest->status !== 'completed') {
            return response()->json(['error' => 'Results must be entered before verification'], 422);
        }

        $result = $labRequest->result;
        $result->update([
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json($result);
    }
}
