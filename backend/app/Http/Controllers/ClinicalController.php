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
        $visit = PatientVisit::with(['vitals', 'prescriptions.items', 'patient'])->findOrFail($id);
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
}
