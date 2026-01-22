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
        if ($alerts['stock'] > 0) $total++; // Treat category as 1 notification
        if ($alerts['lab'] > 0) $total++;
        if ($alerts['backup']['status'] !== 'ok') $total++;

        $alerts['counts'] = $total;

        return response()->json($alerts);
    }
}
