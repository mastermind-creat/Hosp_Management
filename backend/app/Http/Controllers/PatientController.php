<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\Vital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('patient_number', 'like', "%{$search}%")
                  ->orWhere('national_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->paginate($request->get('limit', 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'national_id' => 'nullable|string|unique:patients',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'county' => 'nullable|string',
            'insurance_provider' => 'nullable|string',
            'insurance_number' => 'nullable|string',
            'insurance_type' => 'required|in:nhif,private,corporate,none',
        ]);

        $validated['patient_number'] = 'PAT-' . strtoupper(Str::random(8));
        
        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    public function show($id)
    {
        $patient = Patient::with(['visits' => function($q) {
            $q->latest()->limit(5);
        }])->findOrFail($id);
        
        return response()->json($patient);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_active' => 'sometimes|boolean',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    public function createVisit(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'visit_type' => 'required|in:opd,ipd,emergency',
            'doctor_id' => 'nullable|exists:users,id',
            'chief_complaint' => 'nullable|string',
            'vitals' => 'nullable|array',
            'vitals.temperature' => 'nullable|numeric',
            'vitals.blood_pressure' => 'nullable|string',
            'vitals.pulse_rate' => 'nullable|integer',
            'vitals.weight' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($patient, $validated) {
            $visit = PatientVisit::create([
                'patient_id' => $patient->id,
                'doctor_id' => $validated['doctor_id'] ?? null,
                'visit_type' => $validated['visit_type'],
                'visit_number' => 'VST-' . strtoupper(Str::random(10)),
                'visit_date' => now(),
                'chief_complaint' => $validated['chief_complaint'] ?? null,
                'status' => 'active',
            ]);

            if (isset($validated['vitals'])) {
                Vital::create(array_merge($validated['vitals'], [
                    'visit_id' => $visit->id,
                    'recorded_by' => auth()->id(),
                ]));
            }

            return response()->json($visit->load('vitals'), 201);
        });
    }

    public function visits($id)
    {
        $patient = Patient::findOrFail($id);
        return $patient->visits()->with(['doctor', 'vitals'])->latest()->paginate(10);
    }
}
