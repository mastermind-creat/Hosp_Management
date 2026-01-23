<?php

namespace App\Http\Controllers;

use App\Models\HospitalConfig;
use Illuminate\Http\Request;

class HospitalConfigController extends Controller
{
    /**
     * Get current hospital configuration.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $config = HospitalConfig::current();
        
        return response()->json([
            'config' => $config,
        ]);
    }

    /**
     * Update hospital configuration.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        // Only admins can update config - add middleware check
        $request->validate([
            'hospital_mode' => 'sometimes|in:FULL,COMPACT',
            'allow_multi_role_users' => 'sometimes|boolean',
            'require_role_switching' => 'sometimes|boolean',
            'billing_interrupt_enabled' => 'sometimes|boolean',
            'enabled_departments' => 'sometimes|array',
            'enabled_departments.*' => 'string|in:lab,pharmacy,ward,radiology',
            'minimum_compliance_rules' => 'sometimes|array',
            'notes' => 'sometimes|string|nullable',
        ]);

        $config = HospitalConfig::current();
        $config->updateConfig($request->all());

        return response()->json([
            'message' => 'Hospital configuration updated successfully',
            'config' => $config->fresh(),
        ]);
    }

    /**
     * Toggle department status.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleDepartment(Request $request)
    {
        $request->validate([
            'department' => 'required|string|in:lab,pharmacy,ward,radiology',
            'enabled' => 'required|boolean',
        ]);

        $config = HospitalConfig::current();
        $departments = $config->enabled_departments ?? [];

        if ($request->enabled) {
            if (!in_array($request->department, $departments)) {
                $departments[] = $request->department;
            }
        } else {
            $departments = array_filter($departments, function ($dept) use ($request) {
                return $dept !== $request->department;
            });
            $departments = array_values($departments); // Re-index array
        }

        $config->updateConfig(['enabled_departments' => $departments]);

        return response()->json([
            'message' => "Department {$request->department} " . ($request->enabled ? 'enabled' : 'disabled'),
            'enabled_departments' => $departments,
        ]);
    }

    /**
     * Get compliance rules.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getComplianceRules()
    {
        $config = HospitalConfig::current();
        
        return response()->json([
            'rules' => $config->minimum_compliance_rules ?? [],
        ]);
    }

    /**
     * Update compliance rules.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateComplianceRules(Request $request)
    {
        $request->validate([
            'rules' => 'required|array',
            'rules.payment_before_consultation' => 'sometimes|boolean',
            'rules.payment_before_pharmacy' => 'sometimes|boolean',
            'rules.payment_before_lab' => 'sometimes|boolean',
            'rules.require_vitals_before_consultation' => 'sometimes|boolean',
        ]);

        $config = HospitalConfig::current();
        $config->updateConfig(['minimum_compliance_rules' => $request->rules]);

        return response()->json([
            'message' => 'Compliance rules updated successfully',
            'rules' => $config->minimum_compliance_rules,
        ]);
    }
}
