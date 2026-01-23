<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use App\Models\Department;
use App\Services\PatientFlowService;
use Illuminate\Http\Request;

class VisitQueueController extends Controller
{
    protected $flowService;

    public function __construct(PatientFlowService $flowService)
    {
        $this->flowService = $flowService;
    }

    /**
     * Get the queue for a department.
     */
    public function getQueue(Request $request, $departmentId)
    {
        $status = $request->get('status', 'waiting');
        $queue = $this->flowService->getDepartmentQueue($departmentId, $status);
        return response()->json($queue);
    }

    /**
     * Register/Check-in patient to initial department.
     */
    public function checkIn(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'department_id' => 'required|uuid|exists:departments,id',
            'priority' => 'nullable|in:low,normal,high,emergency',
            'chief_complaint' => 'nullable|string',
        ]);

        $visit = PatientVisit::create([
            'patient_id' => $validated['patient_id'],
            'visit_number' => 'VST-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'visit_date' => now(),
            'visit_type' => 'opd',
            'chief_complaint' => $validated['chief_complaint'] ?? null,
            'status' => 'active',
        ]);

        $this->flowService->queueVisit($visit, $validated['department_id'], $validated['priority'] ?? 'normal');

        return response()->json($visit->load(['patient', 'currentDepartment']), 201);
    }

    /**
     * Transfer patient to another department.
     */
    public function transfer(Request $request, $visitId)
    {
        $validated = $request->validate([
            'department_id' => 'required|uuid|exists:departments,id',
            'priority' => 'nullable|in:low,normal,high,emergency',
        ]);

        $visit = PatientVisit::findOrFail($visitId);
        $this->flowService->transferVisit($visit, $validated['department_id'], $validated['priority'] ?? 'normal');

        return response()->json($visit->load('currentDepartment'));
    }

    /**
     * Start attending to a patient.
     */
    public function startAttending($visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);
        $this->flowService->startAttending($visit);
        return response()->json($visit);
    }

    /**
     * Complete the visit.
     */
    public function complete($visitId)
    {
        $visit = PatientVisit::findOrFail($visitId);
        $this->flowService->completeVisit($visit);
        return response()->json($visit);
    }

    /**
     * Get my department queue (based on user's active role/department).
     */
    public function myQueue(Request $request)
    {
        $user = auth()->user();
        $departmentId = $user->staffProfile->department_id ?? null;

        if (!$departmentId) {
            return response()->json(['error' => 'You are not assigned to any department'], 403);
        }

        $queue = $this->flowService->getDepartmentQueue($departmentId, 'waiting');
        $active = $this->flowService->getDepartmentQueue($departmentId, 'active');

        return response()->json([
            'department' => Department::find($departmentId),
            'waiting' => $queue,
            'active' => $active
        ]);
    }
}
