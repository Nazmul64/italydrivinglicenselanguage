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
        'audio',
        'video',
        'vocabulary',
    ];

    protected $casts = [
        'vocabulary' => 'array',
    ];

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
