<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SampleCollection extends Model
{
    use HasUuids;

    protected $fillable = [
        'request_id',
        'sample_id',
        'collection_date',
        'collected_by',
        'collection_notes',
    ];

    protected $casts = [
        'collection_date' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(TestRequest::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }
}
