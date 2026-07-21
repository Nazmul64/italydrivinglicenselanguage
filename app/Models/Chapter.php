<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'bn_name',
        'description',
        'video_url',
        'video_status',
        'estimated_minutes',
        'image',
        'cover_image',
        'sort_order',
        'chapter_number',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function pages()
    {
        return $this->hasMany(Page::class, 'chapter_id')->orderBy('id', 'asc');
    }
}
