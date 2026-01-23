<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Patient extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_number',
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'gender',
        'national_id',
        'phone',
        'email',
        'address',
        'city',
        'county',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'insurance_provider',
        'insurance_number',
        'insurance_expiry',
        'insurance_type',
        'blood_group',
        'allergies',
        'chronic_conditions',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'insurance_expiry' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = ['name'];

    public function getNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function visits()
    {
        return $this->hasMany(PatientVisit::class);
    }
}
