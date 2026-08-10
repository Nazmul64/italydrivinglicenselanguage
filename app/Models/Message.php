<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'session_id',
        'sender',
        'sender_type',
        'sender_id',
        'sender_name',
        'message',
        'attachment_path',
        'license_key',
        'is_license_card',
    ];

    protected $casts = [
        'is_license_card' => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }
}
