<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PatientVisit;
use App\Models\IpdAdmission;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\TreatmentNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClinicalController extends Controller
{
    public function show($id)
    {
        $visit = PatientVisit::with([
            'vitals', 
            'prescriptions.items', 
            'patient',
            'visitServices.service',
            'testRequests.test'
        ])->findOrFail($id);
        return response()->json($visit);
    }

    public function recordDiagnosis(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);
        
        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }
        
        $validated = $request->validate([
            'diagnosis' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'chief_complaint' => 'nullable|string',
            'history_of_present_illness' => 'nullable|string',
            'examination_findings' => 'nullable|string',
        ]);

        $visit->update($validated);

        return response()->json($visit);
    }

    public function storeTreatmentNote(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);

        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }

        $validated = $request->validate([
            'note' => 'required|string',
            'note_type' => 'required|in:progress,consultation,procedure,other',
        ]);

        $note = TreatmentNote::create([
            'visit_id' => $visit->id,
            'created_by' => auth()->id(),
            'note' => $validated['note'],
            'note_type' => $validated['note_type'],
        ]);

        return response()->json($note, 201);
    }

    public function storePrescription(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);

        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.drug_name' => 'required|string',
            'items.*.dosage' => 'required|string',
            'items.*.frequency' => 'required|string',
            'items.*.duration_days' => 'required|integer',
            'items.*.quantity' => 'required|integer',
            'items.*.instructions' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($visit, $validated) {
            $prescription = Prescription::create([
                'visit_id' => $visit->id,
                'patient_id' => $visit->patient_id,
                'prescribed_by' => auth()->id(),
                'prescription_number' => 'RX-' . strtoupper(Str::random(10)),
                'prescription_date' => now(),
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
            ]);

            foreach ($validated['items'] as $item) {
                PrescriptionItem::create(array_merge($item, [
                    'prescription_id' => $prescription->id,
                ]));
            }

            return response()->json($prescription->load('items'), 201);
        });
    }

    public function admitPatient(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);
        
        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }

        // Check if already admitted
        if ($visit->patient->visits()->whereHas('ipdAdmission', function($q) {
            $q->where('status', 'admitted');
        })->exists()) {
            return response()->json(['error' => 'Patient is already admitted'], 422);
        }

        $validated = $request->validate([
            'ward' => 'required|string',
            'bed_number' => 'required|string',
            'admission_reason' => 'required|string',
            'initial_assessment' => 'nullable|string',
            'admission_orders' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $visit) {
            $admission = IpdAdmission::create(array_merge($validated, [
                'patient_id' => $visit->patient_id,
                'visit_id' => $visit->id,
                'admission_number' => 'ADM-' . strtoupper(Str::random(10)),
                'admission_date' => now(),
                'status' => 'admitted',
                'admitted_by' => auth()->id(),
            ]));

            $visit->update(['visit_type' => 'ipd']);

            return response()->json($admission, 201);
        });
    }

    public function dischargePatient(Request $request, $admissionId)
    {
        $admission = IpdAdmission::findOrFail($admissionId);
        
        if ($admission->status === 'discharged') {
            return response()->json(['error' => 'Patient is already discharged'], 422);
        }

        $validated = $request->validate([
            'discharge_summary' => 'required|string',
        ]);

        $admission->update([
            'discharge_date' => now(),
            'discharge_summary' => $validated['discharge_summary'],
            'status' => 'discharged',
            'discharged_by' => auth()->id(),
        ]);

        return response()->json($admission);
    }

    public function storeVitals(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);

        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }

        $validated = $request->validate([
            'temperature' => 'nullable|numeric',
            'blood_pressure' => 'nullable|string',
            'pulse_rate' => 'nullable|numeric',
            'respiratory_rate' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'oxygen_saturation' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        // Filter out null/empty values to avoid validation/type issues
        $data = array_filter($validated, function($value) {
            return $value !== null && $value !== '';
        });

        $vitals = \App\Models\Vital::updateOrCreate(
            ['visit_id' => $visit->id],
            array_merge($data, [
                'recorded_by' => auth()->id(),
                'bmi' => (isset($data['weight']) && isset($data['height']) && $data['height'] > 0) 
                    ? $data['weight'] / ( ($data['height']/100) * ($data['height']/100) ) 
                    : null
            ])
        );

        return response()->json($vitals, 201);
    }

    public function storeLabRequests(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);

        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }

        $validated = $request->validate([
            'tests' => 'required|array|min:1',
            'tests.*.id' => 'required|exists:lab_tests,id',
            'priority' => 'nullable|in:routine,urgent,stat',
            'clinical_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($visit, $validated) {
            $requests = [];
            foreach ($validated['tests'] as $test) {
                $requests[] = \App\Models\TestRequest::create([
                    'visit_id' => $visit->id,
                    'patient_id' => $visit->patient_id,
                    'test_id' => $test['id'],
                    'priority' => $validated['priority'] ?? 'routine',
                    'clinical_notes' => $validated['clinical_notes'] ?? null,
                    'request_number' => 'LAB-' . strtoupper(Str::random(10)),
                    'request_date' => now(),
                    'requested_by' => auth()->id(),
                    'status' => 'pending',
                ]);
            }

            return response()->json($requests, 201);
        });
    }

    public function storeServices(Request $request, $visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);

        if ($visit->status === 'completed') {
            return response()->json(['error' => 'Completed encounters are read-only'], 403);
        }

        $validated = $request->validate([
            'services' => 'required|array|min:1',
            'services.*.id' => 'required|exists:services,id',
            'services.*.quantity' => 'nullable|integer|min:1',
            'services.*.notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($visit, $validated) {
            $visitServices = [];
            foreach ($validated['services'] as $item) {
                $service = \App\Models\Service::findOrFail($item['id']);
                $quantity = $item['quantity'] ?? 1;
                
                $visitServices[] = \App\Models\VisitService::create([
                    'visit_id' => $visit->id,
                    'service_id' => $service->id,
                    'unit_price' => $service->price,
                    'quantity' => $quantity,
                    'total_price' => $service->price * $quantity,
                    'notes' => $item['notes'] ?? null,
                    'recorded_by' => auth()->id(),
                ]);
            }

            return response()->json($visitServices, 201);
        });
    }
}
