<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RoleContextLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'from_role_id',
        'to_role_id',
        'switched_at',
        'ip_address',
        'user_agent',
        'session_id',
    ];

    protected $casts = [
        'switched_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fromRole()
    {
        return $this->belongsTo(Role::class, 'from_role_id');
    }

    public function toRole()
    {
        return $this->belongsTo(Role::class, 'to_role_id');
    }
}
