<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedMcq extends Model
{
    use HasFactory;

    protected $table = 'saved_mcqs';

    protected $fillable = [
        'session_id',
        'user_id',
        'question_id',
        'type',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function cartelloQuestion()
    {
        return $this->belongsTo(CartelloMcq::class, 'question_id');
    }
}
