<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'page_id',
        'question_id',
        'type',
        'note_text',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function cartelloQuestion()
    {
        return $this->belongsTo(CartelloMcq::class, 'question_id');
    }

    public function cartelloPage()
    {
        return $this->belongsTo(CartelloPage::class, 'page_id');
    }
}
