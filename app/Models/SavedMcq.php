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
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
