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
        'answers'
    ];

    protected $casts = [
        'answers' => 'array'
    ];
}
