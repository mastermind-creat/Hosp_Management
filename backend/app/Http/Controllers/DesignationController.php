<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DesignationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Designation::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        // Check if a trashed designation with the same name exists
        $existing = \App\Models\Designation::withTrashed()->where('name', $validated['name'])->first();
        
        if ($existing) {
            if ($existing->trashed()) {
                $existing->restore();
                $existing->update($validated);
                return response()->json($existing, 200);
            } else {
                return response()->json([
                    'message' => 'The name has already been taken.',
                    'errors' => ['name' => ['The name has already been taken.']]
                ], 422);
            }
        }

        $designation = \App\Models\Designation::create($validated);
        return response()->json($designation, 201);
    }

    public function show(string $id)
    {
        return \App\Models\Designation::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $designation = \App\Models\Designation::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:designations,name,' . $id . ',id|max:255',
            'description' => 'nullable|string'
        ]);

        $designation->update($validated);
        return response()->json($designation);
    }

    public function destroy(string $id)
    {
        $designation = \App\Models\Designation::findOrFail($id);
        if ($designation->staff()->exists()) {
            return response()->json(['error' => 'Cannot delete designation with active staff'], 422);
        }
        $designation->delete();
        return response()->json(null, 204);
    }
}
