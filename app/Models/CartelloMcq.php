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
        'voice',
        'video',
        'vocabulary',
        'status',
    ];

    protected $casts = [
        'vocabulary' => 'array',
        'status'     => 'boolean',
    ];

    public function page()
    {
        return $this->belongsTo(CartelloPage::class, 'page_id');
    }
}
