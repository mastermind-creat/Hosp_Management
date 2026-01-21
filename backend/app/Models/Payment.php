<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'payment_number',
        'invoice_id',
        'patient_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference_number',
        'notes',
        'received_by',
        'voided_by',
        'voided_at',
        'void_reason',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
