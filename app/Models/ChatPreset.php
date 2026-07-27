<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatPreset extends Model
{
    protected $fillable = [
        'title',
        'type',
        'days',
        'message_text',
        'bg_color',
        'text_color',
        'order_index',
        'status'
    ];
}
