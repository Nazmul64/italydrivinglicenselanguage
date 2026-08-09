<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_url',
        'destination_url',
        'status_code',
        'is_active',
        'hits',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'hits' => 'integer',
        'status_code' => 'integer',
    ];
}
