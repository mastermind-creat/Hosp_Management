<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TreatmentNote extends Model
{
    use HasUuids;

    protected $fillable = [
        'visit_id',
        'created_by',
        'note',
        'note_type',
    ];

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
