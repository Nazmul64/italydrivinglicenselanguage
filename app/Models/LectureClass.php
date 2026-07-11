<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LectureClass extends Model
{
    protected $fillable = ['title', 'duration', 'thumbnail_url', 'video_url', 'description', 'youtube_url', 'vimeo_url', 'video_path', 'chapter_id', 'status'];
}
