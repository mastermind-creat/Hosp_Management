<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\User;
use App\Models\HospitalConfig;
use App\Models\Invoice;

class PatientFlowService
{
    /**
     * Patient workflow steps in order.
     */
    const WORKFLOW_STEPS = [
        'REGISTRATION' => 'registration',
        'BILLING_CONSULTATION' => 'billing_consultation',
        'VITALS' => 'vitals',
        'CONSULTATION' => 'consultation',
        'BILLING_PHARMACY' => 'billing_pharmacy',
        'PHARMACY' => 'pharmacy',
        'BILLING_LAB' => 'billing_lab',
        'LAB' => 'lab',
        'DISCHARGE' => 'discharge',
    ];

    /**
     * Map workflow steps to required permissions.
     */
    const STEP_PERMISSIONS = [
        'registration' => 'create_patients',
        'billing_consultation' => 'record_payments',
        'vitals' => 'record_vitals',
        'consultation' => 'record_diagnosis',
        'billing_pharmacy' => 'record_payments',
        'pharmacy' => 'dispense_drugs',
        'billing_lab' => 'record_payments',
        'lab' => 'enter_lab_results',
        'discharge' => 'manage_admissions',
    ];

    /**
     * Get current workflow step for a patient.
     *
     * @param Patient $patient
     * @return string
     */
    public function getCurrentStep(Patient $patient): string
    {
        // Logic to determine current step based on patient state
        // This is simplified - you'll need to check actual patient records
        
        if (!$patient->registration_completed_at) {
            return self::WORKFLOW_STEPS['REGISTRATION'];
        }

        // Check if consultation fee is paid
        if (!$this->isConsultationPaid($patient)) {
            return self::WORKFLOW_STEPS['BILLING_CONSULTATION'];
        }

        // Check if vitals are recorded
        if (!$this->hasVitals($patient)) {
            return self::WORKFLOW_STEPS['VITALS'];
        }

        // Check if consultation is done
        if (!$this->hasConsultation($patient)) {
            return self::WORKFLOW_STEPS['CONSULTATION'];
        }

        // Check if there's a prescription
        if ($this->hasPrescription($patient)) {
            if (!$this->isPharmacyPaid($patient)) {
                return self::WORKFLOW_STEPS['BILLING_PHARMACY'];
            }
            if (!$this->isDrugDispensed($patient)) {
                return self::WORKFLOW_STEPS['PHARMACY'];
            }
        }

        // Check if there are lab orders
        if ($this->hasLabOrders($patient)) {
            if (!$this->isLabPaid($patient)) {
                return self::WORKFLOW_STEPS['BILLING_LAB'];
            }
            if (!$this->isLabCompleted($patient)) {
                return self::WORKFLOW_STEPS['LAB'];
            }
        }

        return self::WORKFLOW_STEPS['DISCHARGE'];
    }

    /**
     * Validate if user can proceed to next step.
     *
     * @param Patient $patient
     * @param string $nextStep
     * @param User $user
     * @return array
     */
    public function canProceedToStep(Patient $patient, string $nextStep, User $user): array
    {
        $config = HospitalConfig::current();
        $currentStep = $this->getCurrentStep($patient);

        // Check if step is in correct order
        $currentIndex = array_search($currentStep, self::WORKFLOW_STEPS);
        $nextIndex = array_search($nextStep, self::WORKFLOW_STEPS);

        if ($nextIndex !== false && $nextIndex < $currentIndex) {
            return [
                'allowed' => false,
                'reason' => 'Cannot go back to previous steps',
            ];
        }

        // Check billing interrupts
        if ($config->billing_interrupt_enabled) {
            if ($nextStep === self::WORKFLOW_STEPS['CONSULTATION'] && !$this->isConsultationPaid($patient)) {
                return [
                    'allowed' => false,
                    'reason' => 'Consultation fee must be paid before proceeding',
                    'requires' => 'payment',
                ];
            }

            if ($nextStep === self::WORKFLOW_STEPS['PHARMACY'] && !$this->isPharmacyPaid($patient)) {
                return [
                    'allowed' => false,
                    'reason' => 'Pharmacy fee must be paid before dispensing',
                    'requires' => 'payment',
                ];
            }
        }

        // Check compliance rules
        $rules = $config->minimum_compliance_rules ?? [];
        if (isset($rules['require_vitals_before_consultation']) && $rules['require_vitals_before_consultation']) {
            if ($nextStep === self::WORKFLOW_STEPS['CONSULTATION'] && !$this->hasVitals($patient)) {
                return [
                    'allowed' => false,
                    'reason' => 'Vitals must be recorded before consultation',
                    'requires' => 'vitals',
                ];
            }
        }

        // Check user permission for this step
        $requiredPermission = self::STEP_PERMISSIONS[$nextStep] ?? null;
        if ($requiredPermission && !$user->hasPermission($requiredPermission)) {
            return [
                'allowed' => false,
                'reason' => 'You do not have permission to perform this action',
                'requires' => 'permission',
                'required_permission' => $requiredPermission,
            ];
        }

        return [
            'allowed' => true,
            'reason' => 'Can proceed',
        ];
    }

    /**
     * Get required role for a workflow step.
     *
     * @param string $step
     * @return string|null
     */
    public function getRequiredRoleForStep(string $step): ?string
    {
        $permissionToRole = [
            'create_patients' => 'receptionist',
            'record_payments' => 'accountant',
            'record_vitals' => 'nurse',
            'record_diagnosis' => 'doctor',
            'dispense_drugs' => 'pharmacist',
            'enter_lab_results' => 'lab_tech',
            'manage_admissions' => 'nurse',
        ];

        $permission = self::STEP_PERMISSIONS[$step] ?? null;
        return $permission ? ($permissionToRole[$permission] ?? null) : null;
    }

    /**
     * Get next available actions for patient.
     *
     * @param Patient $patient
     * @param User $user
     * @return array
     */
    public function getNextAvailableActions(Patient $patient, User $user): array
    {
        $currentStep = $this->getCurrentStep($patient);
        $actions = [];

        // Define possible next steps based on current step
        $nextSteps = $this->getPossibleNextSteps($currentStep);

        foreach ($nextSteps as $step) {
            $canProceed = $this->canProceedToStep($patient, $step, $user);
            $actions[] = [
                'step' => $step,
                'label' => $this->getStepLabel($step),
                'allowed' => $canProceed['allowed'],
                'reason' => $canProceed['reason'],
                'required_role' => $this->getRequiredRoleForStep($step),
            ];
        }

        return $actions;
    }

    /**
     * Get possible next steps from current step.
     */
    protected function getPossibleNextSteps(string $currentStep): array
    {
        $stepMap = [
            'registration' => ['billing_consultation'],
            'billing_consultation' => ['vitals'],
            'vitals' => ['consultation'],
            'consultation' => ['billing_pharmacy', 'billing_lab', 'discharge'],
            'billing_pharmacy' => ['pharmacy'],
            'pharmacy' => ['discharge'],
            'billing_lab' => ['lab'],
            'lab' => ['discharge'],
        ];

        return $stepMap[$currentStep] ?? [];
    }

    /**
     * Get human-readable label for step.
     */
    protected function getStepLabel(string $step): string
    {
        $labels = [
            'registration' => 'Register Patient',
            'billing_consultation' => 'Collect Consultation Fee',
            'vitals' => 'Record Vitals',
            'consultation' => 'Doctor Consultation',
            'billing_pharmacy' => 'Collect Medication Fee',
            'pharmacy' => 'Dispense Drugs',
            'billing_lab' => 'Collect Lab Fee',
            'lab' => 'Process Lab Tests',
            'discharge' => 'Discharge Patient',
        ];

        return $labels[$step] ?? ucfirst(str_replace('_', ' ', $step));
    }

    // Helper methods to check patient state
    protected function isConsultationPaid(Patient $patient): bool
    {
        // Check if consultation invoice is paid
        return Invoice::where('patient_id', $patient->id)
            ->where('invoice_type', 'consultation')
            ->where('payment_status', 'paid')
            ->exists();
    }

    protected function hasVitals(Patient $patient): bool
    {
        // Check if patient has vitals recorded in current visit
        return $patient->visits()
            ->whereNotNull('vitals_recorded_at')
            ->exists();
    }

    protected function hasConsultation(Patient $patient): bool
    {
        return $patient->visits()
            ->whereNotNull('consultation_completed_at')
            ->exists();
    }

    protected function hasPrescription(Patient $patient): bool
    {
        return $patient->visits()
            ->whereHas('prescriptions')
            ->exists();
    }

    protected function isPharmacyPaid(Patient $patient): bool
    {
        return Invoice::where('patient_id', $patient->id)
            ->where('invoice_type', 'pharmacy')
            ->where('payment_status', 'paid')
            ->exists();
    }

    protected function isDrugDispensed(Patient $patient): bool
    {
        return $patient->visits()
            ->whereHas('prescriptions', function ($query) {
                $query->where('dispensed', true);
            })
            ->exists();
    }

    protected function hasLabOrders(Patient $patient): bool
    {
        return $patient->visits()
            ->whereHas('labRequests')
            ->exists();
    }

    protected function isLabPaid(Patient $patient): bool
    {
        return Invoice::where('patient_id', $patient->id)
            ->where('invoice_type', 'laboratory')
            ->where('payment_status', 'paid')
            ->exists();
    }

    protected function isLabCompleted(Patient $patient): bool
    {
        return $patient->visits()
            ->whereHas('labRequests', function ($query) {
                $query->where('status', 'completed');
            })
            ->exists();
    }

    /**
     * Queue a patient visit to a specific department.
     */
    public function queueVisit(\App\Models\PatientVisit $visit, string $departmentId, string $priority = 'normal'): \App\Models\PatientVisit
    {
        $visit->update([
            'current_department_id' => $departmentId,
            'queue_status' => 'waiting',
            'priority' => $priority,
            'queued_at' => now(),
        ]);

        return $visit->load('currentDepartment');
    }

    /**
     * Start attending to a patient in the current department.
     */
    public function startAttending(\App\Models\PatientVisit $visit): \App\Models\PatientVisit
    {
        $visit->update([
            'queue_status' => 'active',
        ]);

        return $visit;
    }

    /**
     * Finish work in the current department and mark as ready for transfer or completion.
     */
    public function finishStep(\App\Models\PatientVisit $visit): \App\Models\PatientVisit
    {
        $visit->update([
            'queue_status' => 'finished',
        ]);

        return $visit;
    }

    /**
     * Transfer patient to another department.
     */
    public function transferVisit(\App\Models\PatientVisit $visit, string $toDepartmentId, string $priority = 'normal'): \App\Models\PatientVisit
    {
        $visit->update([
            'current_department_id' => $toDepartmentId,
            'queue_status' => 'waiting',
            'priority' => $priority,
            'queued_at' => now(),
        ]);

        return $visit->load('currentDepartment');
    }

    /**
     * Complete the entire visit.
     */
    public function completeVisit(\App\Models\PatientVisit $visit): \App\Models\PatientVisit
    {
        $visit->update([
            'queue_status' => 'completed',
            'status' => 'completed',
            'current_department_id' => null,
        ]);

        return $visit;
    }

    /**
     * Get queue for a specific department.
     */
    public function getDepartmentQueue(string $departmentId, string $status = 'waiting')
    {
        return \App\Models\PatientVisit::with(['patient', 'doctor'])
            ->where('current_department_id', $departmentId)
            ->where('queue_status', $status)
            ->orderByRaw("CASE 
                WHEN priority = 'emergency' THEN 1 
                WHEN priority = 'high' THEN 2 
                WHEN priority = 'normal' THEN 3 
                ELSE 4 END")
            ->orderBy('queued_at', 'asc')
            ->get();
    }
}
