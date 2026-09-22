<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'chapter',
        'chapter_name',
        'question_type',
        'page_id',
        'sort_order',
        'italian',
        'bangla',
        'is_vero',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_answer',
        'explanation',
        'image',
        'image_position',
        'audio',
        'video',
        'vocabulary',
    ];

    protected $casts = [
        'vocabulary' => 'array',
        'is_vero'    => 'boolean',
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

    public function getVocabularyAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatVocabulary($value);
    }

    public function page()
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'question_id');
    }

    public function savedMcqs()
    {
        return $this->hasMany(SavedMcq::class, 'question_id');
    }
}
