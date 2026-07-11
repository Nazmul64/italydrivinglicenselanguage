<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartelloMcq extends Model
{
    protected $table = 'cartello_mcqs';

    protected $fillable = [
        'page_id',
        'question',
        'bn_question',
        'option_a',
        'bn_option_a',
        'option_b',
        'bn_option_b',
        'option_c',
        'bn_option_c',
        'option_d',
        'bn_option_d',
        'correct_answer',
        'explanation',
        'bn_explanation',
        'image',
        'status',
    ];

    public function page()
    {
        return $this->belongsTo(CartelloPage::class, 'page_id');
    }
}
