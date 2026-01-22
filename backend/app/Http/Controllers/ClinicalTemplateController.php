<?php

namespace App\Http\Controllers;

use App\Models\ClinicalTemplate;
use Illuminate\Http\Request;

class ClinicalTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ClinicalTemplate::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:complaint,finding,diagnosis,plan',
            'label' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template = ClinicalTemplate::create($validated);

        return response()->json($template, 201);
    }

    public function show($id)
    {
        return ClinicalTemplate::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $template = ClinicalTemplate::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|string|in:complaint,finding,diagnosis,plan',
            'label' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return response()->json($template);
    }

    public function destroy($id)
    {
        $template = ClinicalTemplate::findOrFail($id);
        $template->delete();

        return response()->json(null, 204);
    }
}
