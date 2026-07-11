<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppClient extends Model
{
    protected $fillable = ['session_id', 'first_name', 'last_name', 'phone', 'is_active', 'stars', 'progress', 'expires_at'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
