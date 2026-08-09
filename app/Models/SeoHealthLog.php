<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoHealthLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'url',
        'referer',
        'user_agent',
        'ip_address',
        'hits',
    ];

    protected $casts = [
        'hits' => 'integer',
    ];
}
