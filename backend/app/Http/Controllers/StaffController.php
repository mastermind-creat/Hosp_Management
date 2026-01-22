<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\StaffProfile::with(['user', 'department', 'designation'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role_id' => 'required|exists:roles,id',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
            'employee_id' => 'required|string|unique:staff_profiles,employee_id',
            'date_joined' => 'nullable|date',
            'password' => 'required|min:8'
        ]);

        return \DB::transaction(function () use ($validated) {
            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => \Hash::make($validated['password']),
                'is_active' => true
            ]);

            $user->roles()->attach($validated['role_id']);

            $staff = $user->staffProfile()->create([
                'department_id' => $validated['department_id'],
                'designation_id' => $validated['designation_id'],
                'employee_id' => $validated['employee_id'],
                'date_joined' => $validated['date_joined'] ?? now(),
                'employment_status' => 'active'
            ]);

            return response()->json($staff->load(['user', 'department', 'designation']), 201);
        });
    }

    public function show(string $id)
    {
        return \App\Models\StaffProfile::with(['user.roles', 'department', 'designation'])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $staff = \App\Models\StaffProfile::findOrFail($id);
        
        $validated = $request->validate([
            'department_id' => 'sometimes|required|exists:departments,id',
            'designation_id' => 'sometimes|required|exists:designations,id',
            'employment_status' => 'sometimes|required|in:active,suspended,exited',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string'
        ]);

        $staff->update($validated);
        return response()->json($staff->load(['user', 'department', 'designation']));
    }

    public function destroy(string $id)
    {
        $staff = \App\Models\StaffProfile::findOrFail($id);
        // We might want to just soft delete or deactivate the user
        $staff->user->update(['is_active' => false]);
        $staff->delete();
        return response()->json(null, 204);
    }
}
