<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Appointment::with(['patient', 'doctor']);

        if ($request->has('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        return response()->json($query->orderBy('start_time')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'doctor_id' => 'required|uuid|exists:users,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'status' => 'nullable|string|in:pending,confirmed,arrived,cancelled,missed',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $appointment = \App\Models\Appointment::create($validated);

        return response()->json($appointment->load(['patient', 'doctor']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $appointment = \App\Models\Appointment::with(['patient', 'doctor'])->findOrFail($id);
        return response()->json($appointment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $appointment = \App\Models\Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,confirmed,arrived,cancelled,missed',
            'notes' => 'sometimes|nullable|string',
            'appointment_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
        ]);

        $appointment->update($validated);

        return response()->json($appointment->load(['patient', 'doctor']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $appointment = \App\Models\Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json(null, 204);
    }
}
