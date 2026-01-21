<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null $action
     */
    public function handle(Request $request, Closure $next, $action = null): Response
    {
        $response = $next($request);

        // Only log successful or modified requests (e.g., POST, PUT, DELETE) or explicit actions
        $method = $request->method();
        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']) || $action) {
            $user = Auth::user();
            
            // Map request to action if not provided
            if (!$action) {
                $action = strtolower($method);
            }

            // Create Audit Log
            AuditLog::create([
                'user_id' => $user ? $user->id : null,
                'user_name' => $user ? $user->name : 'System/Guest',
                'action' => $action,
                'entity_type' => $this->getEntityType($request),
                'entity_id' => $this->getEntityId($request, $response),
                'description' => "User performed {$action} on " . $request->path(),
                'old_values' => null, // In a real system, you'd capture this before the request
                'new_values' => $method !== 'DELETE' ? json_encode($request->all()) : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }

    private function getEntityType(Request $request)
    {
        $path = $request->path();
        $parts = explode('/', $path);
        return $parts[2] ?? 'unknown'; // assuming /api/v1/entity/...
    }

    private function getEntityId(Request $request, Response $response)
    {
        // Try to get ID from path or response
        $pathItems = explode('/', $request->path());
        $id = end($pathItems);
        if (is_numeric($id) || strlen($id) > 20) { // Check if it looks like an ID
            return $id;
        }
        
        $data = json_decode($response->getContent(), true);
        return $data['id'] ?? $data['user']['id'] ?? null;
    }
}
