<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Department::withCount('staff')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        // Check if a trashed department with the same name exists
        $existing = \App\Models\Department::withTrashed()->where('name', $validated['name'])->first();
        
        if ($existing) {
            if ($existing->trashed()) {
                $existing->restore();
                $existing->update($validated);
                return response()->json($existing, 200);
            } else {
                // If not trashed, manually trigger unique validation error
                return response()->json([
                    'message' => 'The name has already been taken.',
                    'errors' => ['name' => ['The name has already been taken.']]
                ], 422);
            }
        }

        $department = \App\Models\Department::create($validated);
        return response()->json($department, 201);
    }

    public function show(string $id)
    {
        return \App\Models\Department::with('staff.user')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $department = \App\Models\Department::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:departments,name,' . $id . ',id|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    public function destroy(string $id)
    {
        $department = \App\Models\Department::findOrFail($id);
        if ($department->staff()->exists()) {
            return response()->json(['error' => 'Cannot delete department with active staff'], 422);
        }
        $department->delete();
        return response()->json(null, 204);
    }
}
