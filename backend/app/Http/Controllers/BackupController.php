<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    protected $backupService;

    public function __construct(BackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    public function index()
    {
        return response()->json([
            'backups' => $this->backupService->listBackups()
        ]);
    }

    public function store()
    {
        $result = $this->backupService->createBackup();
        
        if ($result['success']) {
            return response()->json([
                'message' => 'Backup created successfully',
                'backup' => $result
            ]);
        }
        
        return response()->json([
            'message' => 'Backup failed',
            'error' => $result['message']
        ], 500);
    }

    public function download($filename)
    {
        $path = $this->backupService->getBackupPath($filename);
        
        if ($path) {
            return response()->download($path);
        }
        
        return response()->json(['message' => 'Backup not found'], 404);
    }

    public function destroy($filename)
    {
        if ($this->backupService->deleteBackup($filename)) {
            return response()->json(['message' => 'Backup deleted successfully']);
        }
        return response()->json(['message' => 'Backup not found'], 404);
    }
}
