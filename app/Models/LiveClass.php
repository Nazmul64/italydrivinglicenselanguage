<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveClass extends Model
{
    protected $fillable = ['title', 'subtitle', 'scheduled_at', 'room_link', 'description', 'date', 'time', 'zoom_link', 'meet_link', 'live_url', 'thumbnail_url', 'speaker_name', 'status'];
}
