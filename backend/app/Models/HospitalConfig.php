<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class HospitalConfig extends Model
{
    protected $table = 'hospital_config';

    protected $fillable = [
        'hospital_mode',
        'allow_multi_role_users',
        'require_role_switching',
        'billing_interrupt_enabled',
        'enabled_departments',
        'minimum_compliance_rules',
        'notes',
    ];

    protected $casts = [
        'allow_multi_role_users' => 'boolean',
        'require_role_switching' => 'boolean',
        'billing_interrupt_enabled' => 'boolean',
        'enabled_departments' => 'array',
        'minimum_compliance_rules' => 'array',
    ];

    /**
     * Get the singleton hospital configuration.
     * Uses caching for performance.
     */
    public static function current()
    {
        return Cache::remember('hospital_config', 3600, function () {
            return self::first() ?? self::create([
                'hospital_mode' => 'FULL',
                'allow_multi_role_users' => true,
                'require_role_switching' => true,
                'billing_interrupt_enabled' => true,
                'enabled_departments' => ['lab', 'pharmacy', 'ward', 'radiology'],
                'minimum_compliance_rules' => [
                    'payment_before_consultation' => false,
                    'payment_before_pharmacy' => true,
                    'payment_before_lab' => false,
                    'require_vitals_before_consultation' => true,
                ],
            ]);
        });
    }

    /**
     * Clear the configuration cache.
     */
    public static function clearCache()
    {
        Cache::forget('hospital_config');
    }

    /**
     * Check if a department is enabled.
     */
    public function isDepartmentEnabled(string $department): bool
    {
        return in_array($department, $this->enabled_departments ?? []);
    }

    /**
     * Check if hospital is in compact mode.
     */
    public function isCompactMode(): bool
    {
        return $this->hospital_mode === 'COMPACT';
    }

    /**
     * Check if hospital is in full mode.
     */
    public function isFullMode(): bool
    {
        return $this->hospital_mode === 'FULL';
    }

    /**
     * Get a specific compliance rule.
     */
    public function getComplianceRule(string $rule): bool
    {
        return $this->minimum_compliance_rules[$rule] ?? false;
    }

    /**
     * Update configuration and clear cache.
     */
    public function updateConfig(array $data)
    {
        $this->update($data);
        self::clearCache();
        return $this;
    }
}
