<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DeviceService
{
    protected $filePath = 'installation.json';

    /**
     * Get the device identity.
     */
    public function getIdentity()
    {
        if (!Storage::exists($this->filePath)) {
            $this->initializeIdentity();
        }

        return json_decode(Storage::get($this->filePath), true);
    }

    /**
     * Initialize a new identity for this installation.
     */
    protected function initializeIdentity()
    {
        $identity = [
            'terminal_id' => 'TERM-' . Str::upper(Str::random(8)),
            'facility_id' => 'FAC-DEFAULT-01',
            'installed_at' => now()->toIso8601String(),
            'version' => '1.0.0',
            'environment' => app()->environment(),
        ];

        Storage::put($this->filePath, json_encode($identity, JSON_PRETTY_PRINT));
    }

    /**
     * Update facility ID binding.
     */
    public function bindFacility($facilityId)
    {
        $identity = $this->getIdentity();
        $identity['facility_id'] = $facilityId;
        $identity['updated_at'] = now()->toIso8601String();
        
        Storage::put($this->filePath, json_encode($identity, JSON_PRETTY_PRINT));
        
        return $identity;
    }
}
