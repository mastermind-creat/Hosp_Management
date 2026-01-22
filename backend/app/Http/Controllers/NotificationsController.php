<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index()
    {
        $alerts = $this->notificationService->getAlerts();
        
        // Calculate total critical counts
        $total = 0;
        foreach (['stock', 'lab', 'clinical', 'pharmacy', 'billing'] as $key) {
            if (isset($alerts[$key]) && $alerts[$key] > 0) {
                $total += $alerts[$key];
            }
        }
        
        if (isset($alerts['backup']['status']) && $alerts['backup']['status'] !== 'ok') {
            $total++;
        }

        $alerts['counts'] = $total;

        return response()->json($alerts);
    }
}
