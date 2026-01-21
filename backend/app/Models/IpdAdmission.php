<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IpdAdmission extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'visit_id',
        'admission_number',
        'admission_date',
        'discharge_date',
        'ward',
        'bed_number',
        'admission_reason',
        'initial_assessment',
        'admission_orders',
        'discharge_summary',
        'status',
        'admitted_by',
        'discharged_by',
    ];

    protected $casts = [
        'admission_date' => 'datetime',
        'discharge_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class);
    }

    public function admittedBy()
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    public function dischargedBy()
    {
        return $this->belongsTo(User::class, 'discharged_by');
    }
}
