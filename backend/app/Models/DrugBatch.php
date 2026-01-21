<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DrugBatch extends Model
{
    use HasUuids;

    protected $fillable = [
        'drug_id',
        'batch_number',
        'quantity_received',
        'quantity_remaining',
        'unit_cost',
        'manufacture_date',
        'expiry_date',
        'supplier_id',
        'received_by',
        'received_at',
    ];

    protected $casts = [
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
        'received_at' => 'datetime',
    ];

    public function drug()
    {
        return $this->belongsTo(Drug::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
