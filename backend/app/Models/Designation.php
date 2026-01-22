<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Designation extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = ['name', 'description'];

    public function staff()
    {
        return $this->hasMany(StaffProfile::class);
    }
}
