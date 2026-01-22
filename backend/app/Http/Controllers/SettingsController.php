<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    /**
     * Get all settings grouped by category.
     */
    public function index()
    {
        $settings = DB::table('settings')->get()->map(function($item) {
            if (isset($item->options) && $item->options) {
                $item->options = json_decode($item->options);
            }
            return $item;
        })->groupBy('group');
        
        return response()->json($settings);
    }

    /**
     * Get a specific setting value (Helper for internal usage or quick fetch).
     */
    public function show($key)
    {
        $setting = DB::table('settings')->where('key', $key)->first();
        if (!$setting) {
            return response()->json(['error' => 'Setting not found'], 404);
        }
        return response()->json($setting);
    }

    /**
     * Update settings in batch.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|exists:settings,key',
            'settings.*.value' => 'nullable'
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['settings'] as $item) {
                DB::table('settings')
                    ->where('key', $item['key'])
                    ->update([
                        'value' => $item['value'],
                        'updated_at' => now()
                    ]);
            }
        });

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Public endpoint to get public config (e.g. Hospital Name) for login page.
     */
    public function publicConfig()
    {
        $keys = [
            'hospital_name', 
            'contact_email', 
            'currency_symbol',
            'hospital_address',
            'hospital_phone',
            'hospital_website',
            'system_language',
            'timezone'
        ];
        
        $settings = DB::table('settings')
            ->whereIn('key', $keys)
            ->get(['key', 'value', 'type', 'options'])
            ->keyBy('key')
            ->map(function($item) {
                return [
                    'value' => $item->value,
                    'type' => $item->type,
                    'options' => $item->options ? json_decode($item->options) : null
                ];
            });
            
        return response()->json($settings);
    }
}
