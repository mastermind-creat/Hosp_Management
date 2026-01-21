<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TestResult extends Model
{
    use HasUuids;

    protected $fillable = [
        'request_id',
        'result_value',
        'unit',
        'interpretation',
        'is_abnormal',
        'technician_notes',
        'entered_by',
        'result_date',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'is_abnormal' => 'boolean',
        'result_date' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(TestRequest::class);
    }

    public function entryBy()
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
