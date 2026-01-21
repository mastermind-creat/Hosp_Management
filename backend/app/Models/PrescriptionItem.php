<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'prescription_id',
        'drug_name',
        'dosage',
        'frequency',
        'duration_days',
        'quantity',
        'instructions',
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }
}
