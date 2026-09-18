<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'bn_title',
        'content',
        'image',
        'audio',
        'video',
        'video_status',
        'sort_order',
        'pdf_path',
        'status',
        'vocabulary',
        'estimated_minutes',
    ];

    protected $casts = [
        'vocabulary'   => 'array',
        'status'       => 'boolean',
        'video_status' => 'boolean',
    ];

    public function getImageAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatImageUrl($value);
    }

    public function getAudioAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }

    public function getVideoAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }

    public function getPdfPathAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }

    public function getVocabularyAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatVocabulary($value);
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'page_id')->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }
}
