<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Get all active alerts.
     */
    public function getAlerts()
    {
        return [
            'stock' => $this->checkLowStock(),
            'lab' => $this->checkPendingResults(),
            'backup' => $this->checkBackupStatus(),
            'counts' => 0 // To be calculated
        ];
    }

    protected function checkLowStock()
    {
        // Mock logic since we assume Pharmacy items table structure
        // In real app: Item::where('stock', '<', 'reorder_level')->count();
        return 3; // Mocking 3 low stock items
    }

    protected function checkPendingResults()
    {
        // Mock logic for pending lab results
        return 5; 
    }

    protected function checkBackupStatus()
    {
        // Check if last backup was > 24 hours ago
        $lastBackup = null;
        $files = array_filter(glob(storage_path('app/backups/*.sqlite')), 'is_file');
        
        if (!empty($files)) {
            array_multisort(array_map('filemtime', $files), SORT_DESC, $files);
            $lastBackup = filemtime($files[0]);
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
