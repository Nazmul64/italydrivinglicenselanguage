<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_identifier'
    ];

    public function post()
    {
        return $this->belongsTo(SocialPost::class, 'post_id');
    }
}
