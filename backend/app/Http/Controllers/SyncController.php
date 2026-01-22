<?php

namespace App\Http\Controllers;

use App\Services\SyncService;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    protected $syncService;

    public function __construct(SyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    public function status()
    {
        return response()->json($this->syncService->getStatus());
    }

    public function trigger()
    {
        $result = $this->syncService->processQueue();
        return response()->json($result);
    }
}
