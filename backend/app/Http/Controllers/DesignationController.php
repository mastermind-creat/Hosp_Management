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
            'name' => 'required|string|unique:designations,name|max:255',
            'description' => 'nullable|string'
        ]);

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
