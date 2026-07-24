<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_text',
        'translated_text',
        'from_lang',
        'to_lang',
        'search_count'
    ];
}
