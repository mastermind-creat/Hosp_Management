<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{
    use HasUuids;

    protected $fillable = [
        'visit_id',
        'temperature',
        'blood_pressure',
        'pulse_rate',
        'respiratory_rate',
        'weight',
        'height',
        'bmi',
        'oxygen_saturation',
        'notes',
        'recorded_by',
    ];

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
