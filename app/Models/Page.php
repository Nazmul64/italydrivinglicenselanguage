<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'bn_title',
        'content',
        'image',
        'audio',
        'video',
        'sort_order',
        'pdf_path',
        'status',
    ];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'page_id');
    }
}
