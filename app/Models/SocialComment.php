<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'author_name',
        'author_phone',
        'author_avatar',
        'comment'
    ];

    public function post()
    {
        return $this->belongsTo(SocialPost::class, 'post_id');
    }
}
