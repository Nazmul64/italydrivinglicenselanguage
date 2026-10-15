<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatPreset extends Model
{
    protected $fillable = [
        'title',
        'type',
        'days',
        'duration_seconds',
        'message_text',
        'bg_color',
        'text_color',
        'order_index',
        'status'
    ];

    protected $casts = [
        'days' => 'integer',
        'duration_seconds' => 'integer',
        'order_index' => 'integer',
        'status' => 'boolean',
    ];
}
