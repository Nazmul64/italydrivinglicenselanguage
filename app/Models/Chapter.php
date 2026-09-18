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

    protected $casts = [
        'status' => 'boolean',
        'video_status' => 'boolean',
    ];

    public function getImageAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatImageUrl($value);
    }

    public function getCoverImageAttribute($value)
    {
        $formatted = \App\Helpers\ImageHelper::formatImageUrl($value);
        if (empty($formatted) && !empty($this->attributes['image'])) {
            return \App\Helpers\ImageHelper::formatImageUrl($this->attributes['image']);
        }
        return $formatted;
    }

    public function getVideoUrlAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function pages()
    {
        return $this->hasMany(Page::class, 'chapter_id')->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'chapter');
    }
}
