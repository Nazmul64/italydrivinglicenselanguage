<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manuale extends Model
{
    use HasFactory;

    protected $table = 'manuales';

    protected $fillable = [
        'title',
        'chapter_number',
        'content',
        'vocabulary',
        'image_path',
        'audio_path',
        'order_index',
        'status',
    ];

    protected $casts = [
        'vocabulary' => 'array',
        'status'     => 'boolean',
    ];

    public function getImagePathAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatImageUrl($value);
    }

    public function getImageAttribute($value)
    {
        return $this->image_path;
    }

    public function getAudioPathAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }

    public function getVocabularyAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatVocabulary($value);
    }
}
