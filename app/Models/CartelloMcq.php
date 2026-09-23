<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartelloMcq extends Model
{
    protected $table = 'cartello_mcqs';

    protected $fillable = [
        'page_id',
        'sort_order',
        'question',
        'bn_question',
        'correct_answer',
        'explanation',
        'bn_explanation',
        'image',
        'image_position',
        'voice',
        'video',
        'vocabulary',
        'status',
    ];

    protected $casts = [
        'vocabulary' => 'array',
        'status'     => 'boolean',
    ];

    public function getImageAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatImageUrl($value);
    }

    public function getVoiceAttribute($value)
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
        return $this->belongsTo(CartelloPage::class, 'page_id');
    }

    protected static function booted()
    {
        static::deleting(function ($mcq) {
            Note::where('question_id', $mcq->id)->where('type', 'cartelli')->delete();
            SavedMcq::where('question_id', $mcq->id)->where('type', 'cartelli')->delete();
            UserMcqResult::where('question_id', $mcq->id)->where('question_type', 'cartelli')->delete();
        });
    }
}
