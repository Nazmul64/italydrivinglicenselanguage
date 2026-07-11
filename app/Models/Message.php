<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['session_id', 'sender', 'sender_name', 'message', 'attachment_path'];
}
