<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LabTest extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'test_code',
        'test_name',
        'category',
        'description',
        'price',
        'sample_type',
        'turnaround_time',
        'normal_range',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function requests()
    {
        return $this->hasMany(TestRequest::class, 'test_id');
    }
}
