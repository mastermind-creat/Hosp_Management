<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use ZipArchive;
use Carbon\Carbon;

class BackupService
{
    protected $dbPath;
    protected $backupDisk = 'local';
    protected $backupFolder = 'backups';

    public function __construct()
    {
        $this->dbPath = database_path('database.sqlite');
    }

    /**
     * Create a ZIP backup of the SQLite database.
     */
    public function createBackup()
    {
        try {
            if (!file_exists($this->dbPath)) {
                throw new \Exception("Database file not found at {$this->dbPath}");
            }

            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $backupName = "backup_{$timestamp}.zip";
            $tempZipPath = storage_path("app/temp_{$backupName}");

            $zip = new ZipArchive();
            if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
                $zip->addFile($this->dbPath, 'database.sqlite');
                $zip->close();
            } else {
                throw new \Exception("Failed to create ZIP archive");
            }

            // Move to final storage location
            $content = file_get_contents($tempZipPath);
            Storage::disk($this->backupDisk)->put("{$this->backupFolder}/{$backupName}", $content);

            // Cleanup temp file
            @unlink($tempZipPath);

            return [
                'success' => true,
                'file' => $backupName,
                'path' => "{$this->backupFolder}/{$backupName}",
                'size' => Storage::disk($this->backupDisk)->size("{$this->backupFolder}/{$backupName}")
            ];

        } catch (\Exception $e) {
            Log::error("Backup failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * List all available backups.
     */
    public function listBackups()
    {
        $files = Storage::disk($this->backupDisk)->files($this->backupFolder);
        $backups = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                $backups[] = [
                    'name' => basename($file),
                    'size' => Storage::disk($this->backupDisk)->size($file),
                    'timestamp' => Storage::disk($this->backupDisk)->lastModified($file),
                    'path' => $file
                ];
            }
        }

        // Sort by newest first
        usort($backups, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return $backups;
    }

    /**
     * Get backup file path for download.
     */
    public function getBackupPath($filename)
    {
        $path = "{$this->backupFolder}/{$filename}";
        if (Storage::disk($this->backupDisk)->exists($path)) {
            return Storage::disk($this->backupDisk)->path($path);
        }
        return null;
    }
    
    /**
     * Delete a backup file.
     */
    public function deleteBackup($filename)
    {
       $path = "{$this->backupFolder}/{$filename}";
       if (Storage::disk($this->backupDisk)->exists($path)) {
           return Storage::disk($this->backupDisk)->delete($path);
       }
       return false;
    }
}
