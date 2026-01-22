<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\PatientVisit;
use App\Models\Prescription;
use App\Models\Drug;
use App\Models\TestRequest;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Get all active alerts, filtered by role permissions if necessary.
     */
    public function getAlerts()
    {
        $user = auth()->user();
        
        $alerts = [
            'stock' => 0,
            'lab' => 0,
            'clinical' => 0,
            'pharmacy' => 0,
            'billing' => 0,
            'backup' => $this->checkBackupStatus(),
            'counts' => 0
        ];

        // 1. Pharmacy / Stock Alerts (For Pharmacist & Admin)
        if ($user->hasPermission('view_drugs')) {
            $alerts['stock'] = Drug::whereHas('batches', function($q) {
                $q->where('quantity', '>', 0);
            })->get()->filter(function($drug) {
                return $drug->totalStock() <= ($drug->reorder_level ?? 10);
            })->count();
        }

        // 2. Pending Lab Requests (For Lab Tech)
        if ($user->hasPermission('enter_lab_results')) {
            $alerts['lab'] = TestRequest::whereIn('status', ['pending', 'sample_collected', 'in_progress'])->count();
        }

        // 3. Pending Consultations (For Doctor)
        if ($user->hasPermission('record_diagnosis')) {
            $alerts['clinical'] = PatientVisit::where('status', 'active')
                ->whereNull('diagnosis')
                ->count();
            
            // Also notify doctor of completed lab results they requested
            $alerts['lab_results_ready'] = TestRequest::where('status', 'completed')
                ->where('requested_by', $user->id)
                ->where('updated_at', '>=', now()->subHours(24))
                ->count();
        }

        // 4. Pending Prescriptions (For Pharmacist)
        if ($user->hasPermission('dispense_drugs')) {
            $alerts['pharmacy'] = Prescription::where('status', 'pending')->count();
        }

        // 5. Unpaid Invoices (For Accountant)
        if ($user->hasPermission('record_payments')) {
            $alerts['billing'] = Invoice::whereIn('status', ['pending', 'partial'])->count();
        }

        return $alerts;
    }

    protected function checkBackupStatus()
    {
        // Check if last backup was > 24 hours ago
        $lastBackup = null;
        $backupDir = storage_path('app/backups');
        
        if (is_dir($backupDir)) {
            $files = array_filter(glob($backupDir . '/*.sqlite'), 'is_file');
            if (!empty($files)) {
                array_multisort(array_map('filemtime', $files), SORT_DESC, $files);
                $lastBackup = filemtime($files[0]);
            }
        }

        if (!$lastBackup || $lastBackup < Carbon::now()->subHours(24)->timestamp) {
            return [
                'status' => 'warning',
                'message' => 'System backup overdue (>24h)'
            ];
        }

        return ['status' => 'ok'];
    }
}
