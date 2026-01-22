<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class PatientVisit extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'visit_type',
        'visit_number',
        'visit_date',
        'chief_complaint',
        'history_of_present_illness',
        'examination_findings',
        'diagnosis',
        'treatment_plan',
        'notes',
        'status',
    ];

    protected $casts = [
        'visit_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function vitals()
    {
        return $this->hasOne(Vital::class, 'visit_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'visit_id');
    }
}
