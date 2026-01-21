<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Drug extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'generic_name',
        'brand_name',
        'strength',
        'form',
        'category',
        'unit_price',
        'reorder_level',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function batches()
    {
        return $this->hasMany(DrugBatch::class);
    }

    public function dispensings()
    {
        return $this->hasMany(DrugDispensing::class);
    }

    public function totalStock()
    {
        return $this->batches()->sum('quantity_remaining');
    }
}
