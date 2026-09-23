<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMcqResult extends Model
{
    use HasFactory;

    protected $table = 'user_mcq_results';

    protected $fillable = [
        'session_id',
        'user_id',
        'question_id',
        'question_type',
        'user_answer',
        'is_correct',
        'category_id',
        'chapter_id',
        'page_id',
        'correct_count',
        'wrong_count',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function cartelloQuestion()
    {
        return $this->belongsTo(CartelloMcq::class, 'question_id');
    }

    public function page()
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
