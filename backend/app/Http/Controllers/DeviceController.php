<?php

namespace App\Http\Controllers;

use App\Services\DeviceService;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    protected $deviceService;

    public function __construct(DeviceService $deviceService)
    {
        $this->deviceService = $deviceService;
    }

    public function getIdentity()
    {
        return response()->json($this->deviceService->getIdentity());
    }

    public function updateFacility(Request $request)
    {
        $validated = $request->validate([
            'facility_id' => 'required|string|max:50',
        ]);

        $identity = $this->deviceService->bindFacility($validated['facility_id']);
        
        return response()->json($identity);
    }
}
