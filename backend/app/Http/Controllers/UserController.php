<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        return $query->paginate($request->get('limit', 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string',
            'employee_id' => 'nullable|string|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);

        // Auto-generate username from email if not provided
        if (empty($validated['username'])) {
            $validated['username'] = explode('@', $validated['email'])[0];
            
            // Ensure uniqueness by appending number if needed
            $baseUsername = $validated['username'];
            $counter = 1;
            while (User::where('username', $validated['username'])->exists()) {
                $validated['username'] = $baseUsername . $counter;
                $counter++;
            }
        }

        // Auto-generate employee_id if not provided
        if (empty($validated['employee_id'])) {
            $year = date('Y');
            $lastEmployee = User::where('employee_id', 'like', "EMP-{$year}-%")
                ->orderBy('employee_id', 'desc')
                ->first();
            
            if ($lastEmployee && preg_match('/EMP-\d{4}-(\d+)/', $lastEmployee->employee_id, $matches)) {
                $nextNumber = intval($matches[1]) + 1;
            } else {
                $nextNumber = 1;
            }
            
            $validated['employee_id'] = sprintf('EMP-%s-%03d', $year, $nextNumber);
        }

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'employee_id' => $validated['employee_id'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $user->roles()->sync($validated['roles']);

        return response()->json($user->load('roles'), 201);
    }

    public function show($id)
    {
        $user = User::with('roles.permissions')->findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => ['sometimes', 'string', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string',
            'employee_id' => ['sometimes', 'string', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'is_active' => 'sometimes|boolean',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return response()->json($user->load('roles'));
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'Cannot delete your own account'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
