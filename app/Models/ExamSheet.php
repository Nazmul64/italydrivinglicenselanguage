<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_name',
        'motorizzazione',
        'exam_date',
        'status',
        'correct_count',
        'wrong_count',
        'unanswered_count',
        'total_count',
        'answers',
        'avatar',
        'user_id',
        'session_id',
        'is_passed',
    ];

    protected $casts = [
        'answers' => 'array'
    ];
}
