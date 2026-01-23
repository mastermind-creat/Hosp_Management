<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\StaffProfile::with(['user.roles', 'department', 'designation']);

        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('employment_status', $request->status);
        }

        if ($request->filled('role_id') && $request->role_id !== 'all') {
            $roleId = $request->role_id;
            $query->whereHas('user.roles', function($q) use ($roleId) {
                $q->where('roles.id', $roleId);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($qu) use ($search) {
                    $qu->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role_id' => 'required|exists:roles,id',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
            'employee_id' => 'nullable|string|unique:staff_profiles,employee_id',
            'date_joined' => 'nullable|date',
            'password' => 'required|min:8'
        ]);

        return \DB::transaction(function () use ($validated) {
            // Auto-generate username from email
            $username = explode('@', $validated['email'])[0];
            $baseUsername = $username;
            $counter = 1;
            while (\App\Models\User::where('username', $username)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }

            // Auto-generate employee_id if not provided
            if (empty($validated['employee_id'])) {
                $year = date('Y');
                $lastEmployee = \App\Models\User::where('employee_id', 'like', "EMP-{$year}-%")
                    ->orderBy('employee_id', 'desc')
                    ->first();
                
                if ($lastEmployee && preg_match('/EMP-\d{4}-(\d+)/', $lastEmployee->employee_id, $matches)) {
                    $nextNumber = intval($matches[1]) + 1;
                } else {
                    $nextNumber = 1;
                }
                
                $validated['employee_id'] = sprintf('EMP-%s-%03d', $year, $nextNumber);
            }

            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'username' => $username,
                'email' => $validated['email'],
                'employee_id' => $validated['employee_id'],
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
        $staff = \App\Models\StaffProfile::with('user')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $staff->user_id,
            'password' => 'sometimes|nullable|min:8',
            'role_id' => 'sometimes|required|exists:roles,id',
            'department_id' => 'sometimes|required|exists:departments,id',
            'designation_id' => 'sometimes|required|exists:designations,id',
            'employment_status' => 'sometimes|required|in:active,suspended,exited',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string'
        ]);

        return \DB::transaction(function () use ($staff, $validated) {
            // Update User
            $userData = [];
            if (isset($validated['name'])) $userData['name'] = $validated['name'];
            if (isset($validated['email'])) $userData['email'] = $validated['email'];
            if (!empty($validated['password'])) $userData['password'] = \Hash::make($validated['password']);
            
            if (!empty($userData)) {
                $staff->user->update($userData);
            }

            // Update Role
            if (isset($validated['role_id'])) {
                $staff->user->roles()->sync([$validated['role_id']]);
            }

            // Update Staff Profile
            $staff->update($validated);
            
            return response()->json($staff->load(['user', 'department', 'designation']));
        });
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
