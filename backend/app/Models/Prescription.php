<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prescription extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'visit_id',
        'patient_id',
        'prescribed_by',
        'prescription_number',
        'prescription_date',
        'notes',
        'status',
    ];

    protected $casts = [
        'prescription_date' => 'datetime',
    ];

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function prescribedBy()
    {
        return $this->belongsTo(User::class, 'prescribed_by');
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
