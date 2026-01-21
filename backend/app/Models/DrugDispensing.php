<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DrugDispensing extends Model
{
    use HasUuids;

    protected $table = 'drug_dispensing';

    protected $fillable = [
        'patient_id',
        'prescription_id',
        'drug_id',
        'batch_id',
        'quantity',
        'unit_price',
        'total_price',
        'dispensed_by',
        'dispensed_at',
        'invoice_id',
    ];

    protected $casts = [
        'dispensed_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    public function drug()
    {
        return $this->belongsTo(Drug::class);
    }

    public function batch()
    {
        return $this->belongsTo(DrugBatch::class, 'batch_id');
    }

    public function dispenser()
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }
}
