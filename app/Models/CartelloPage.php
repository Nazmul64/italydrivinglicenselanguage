<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartelloPage extends Model
{
    protected $table = 'cartello_pages';

    protected $fillable = [
        'chapter_id',
        'page_number',
        'title',
        'bn_title',
        'description',
        'bn_description',
        'image',
        'video',
        'sort_order',
        'status',
    ];

    public function chapter()
    {
        return $this->belongsTo(CartelloChapter::class, 'chapter_id');
    }

    public function mcqs()
    {
        return $this->hasMany(CartelloMcq::class, 'page_id')->orderBy('sort_order', 'asc');
    }
}
