<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SyncService
{
    protected $cloudUrl = 'https://api.hospital-cloud.com/v1/sync'; // Mock URL
    protected $deviceService;

    public function __construct(DeviceService $deviceService)
    {
        $this->deviceService = $deviceService;
    }

    /**
     * Get the current terminal ID
     */
    protected function getTerminalId()
    {
        return $this->deviceService->getIdentity()['terminal_id'] ?? 'UNKNOWN';
    }

    /**
     * Add a model change to the sync queue.
     */
    public function addToQueue($model, $action)
    {
        try {
            DB::table('sync_queue')->insert([
                'id' => (string) Str::uuid(),
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'action' => $action,
                'payload' => json_encode($model->toArray()),
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to add to sync queue: " . $e->getMessage());
        }
    }

    /**
     * Process pending items in the queue.
     */
    public function processQueue($batchSize = 20)
    {
        $batchId = (string) Str::uuid();
        $items = DB::table('sync_queue')
            ->where('status', 'pending')
            ->orderBy('queued_at', 'asc')
            ->limit($batchSize)
            ->get();

        if ($items->isEmpty()) {
            return ['status' => 'completed', 'message' => 'No items onto sync'];
        }

        $processed = 0;
        $failed = 0;

        DB::table('sync_history')->insert([
            'id' => $batchId,
            'sync_started_at' => now(),
            'status' => 'in_progress',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($items as $item) {
            try {
                // Determine API endpoint based on model type (Mock logic)
                // In production, you'd map Model::class to /api/resource
                
                // Simulate network request
                $success = $this->mockSendToCloud($item);

                if ($success) {
                    DB::table('sync_queue')
                        ->where('id', $item->id)
                        ->update([
                            'status' => 'synced',
                            'synced_at' => now(),
                            'updated_at' => now()
                        ]);
                    $processed++;
                } else {
                    throw new \Exception("Simulated cloud rejection");
                }

            } catch (\Exception $e) {
                $failed++;
                DB::table('sync_queue')
                    ->where('id', $item->id)
                    ->update([
                        'status' => 'failed',
                        'attempts' => $item->attempts + 1,
                        'error_message' => $e->getMessage(),
                        'updated_at' => now()
                    ]);
            }
        }

        DB::table('sync_history')
            ->where('id', $batchId)
            ->update([
                'sync_completed_at' => now(),
                'items_processed' => $processed,
                'items_failed' => $failed,
                'status' => $failed > 0 ? 'partial_failure' : 'success'
            ]);

        return [
            'status' => 'completed',
            'processed' => $processed,
            'failed' => $failed,
            'batch_id' => $batchId
        ];
    }

    /**
     * Mock sending data to cloud.
     */
    private function mockSendToCloud($item)
    {
        // 90% chance of success for demo purposes
        return rand(1, 10) > 1;
    }

    /**
     * Get sync status statistics.
     */
    public function getStatus()
    {
        return [
            'pending_count' => DB::table('sync_queue')->where('status', 'pending')->count(),
            'failed_count' => DB::table('sync_queue')->where('status', 'failed')->count(),
            'last_sync' => DB::table('sync_history')
                ->where('status', 'success')
                ->latest('sync_completed_at')
                ->first(),
            'terminal_id' => $this->getTerminalId()
        ];
    }
}
