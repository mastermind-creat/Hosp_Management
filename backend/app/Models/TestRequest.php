<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TestRequest extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'request_number',
        'patient_id',
        'visit_id',
        'test_id',
        'requested_by',
        'request_date',
        'priority',
        'clinical_notes',
        'status',
        'invoice_id',
    ];

    protected $casts = [
        'request_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class);
    }

    public function test()
    {
        return $this->belongsTo(LabTest::class, 'test_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function sample()
    {
        return $this->hasOne(SampleCollection::class, 'request_id');
    }

    public function result()
    {
        return $this->hasOne(TestResult::class, 'request_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
