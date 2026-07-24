<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'author_name',
        'author_phone',
        'author_avatar',
        'content',
        'image_path',
        'likes_count',
        'comments_count',
        'status'
    ];

    public function comments()
    {
        return $this->hasMany(SocialComment::class, 'post_id')->orderBy('created_at', 'asc');
    }

    public function likes()
    {
        return $this->hasMany(SocialLike::class, 'post_id');
    }
}
