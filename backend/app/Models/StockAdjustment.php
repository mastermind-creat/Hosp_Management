<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StockAdjustment extends Model
{
    use HasUuids;

    protected $fillable = [
        'drug_id',
        'batch_id',
        'adjustment_type',
        'quantity',
        'reason',
        'adjusted_by',
    ];

    public function drug()
    {
        return $this->belongsTo(Drug::class);
    }

    public function batch()
    {
        return $this->belongsTo(DrugBatch::class);
    }

    public function adjuster()
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }
}
