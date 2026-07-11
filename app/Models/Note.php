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
}
