<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SystemLogsController extends Controller
{
    public function index(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');
        
        if (!File::exists($logPath)) {
            return response()->json(['logs' => []]);
        }

        $logContent = File::get($logPath);
        $lines = explode("\n", $logContent);
        $logs = [];

        // Parse log lines (simplified for example)
        // Standard Laravel log format: [YYYY-MM-DD HH:MM:SS] env.LEVEL: Message {"context"}
        $pattern = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)/';

        foreach (array_reverse($lines) as $line) {
            if (empty(trim($line))) continue;

            if (preg_match($pattern, $line, $matches)) {
                $logs[] = [
                    'timestamp' => $matches[1],
                    'environment' => $matches[2],
                    'level' => $matches[3],
                    'message' => $matches[4],
                    'context' => [], // Context parsing can be added if needed
                    'id' => md5($line . rand()), // Temporary ID for frontend keys
                ];
            } else {
                // Handle multiline logs (stack traces) - simplified: append to previous message
                // For now, we'll just skip complex multiline parsing for MVP
            }
            
            // Limit to last 500 logs to prevent memory issues
            if (count($logs) >= 500) break;
        }

        // Filter by level if requested
        if ($request->has('level')) {
            $level = strtoupper($request->level);
            $logs = array_filter($logs, function($log) use ($level) {
                return $log['level'] === $level;
            });
        }

        // Pagination
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 50);
        $total = count($logs);
        $logs = array_slice($logs, ($page - 1) * $perPage, $perPage);

        return response()->json([
            'data' => array_values($logs),
            'total' => $total,
            'current_page' => (int)$page,
            'per_page' => (int)$perPage,
            'last_page' => ceil($total / $perPage),
        ]);
    }
}
