<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'name',
        'bn_name',
        'description',
        'image',
        'cover_image',
        'sort_order',
        'chapter_number',
        'status',
    ];

    public function pages()
    {
        return $this->hasMany(Page::class, 'chapter_id')->orderBy('id', 'asc');
    }
}
