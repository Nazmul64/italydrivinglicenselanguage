<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manuale extends Model
{
    use HasFactory;

    protected $table = 'manuales';

    protected $fillable = [
        'title',
        'chapter_number',
        'content',
        'vocabulary',
        'image_path',
        'audio_path',
        'order_index',
        'status',
    ];

    protected $casts = [
        'vocabulary' => 'array',
    ];
}
