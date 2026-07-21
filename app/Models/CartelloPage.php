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
        'voice',
        'translation',
        'is_vero',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'is_vero' => 'boolean',
        'status'  => 'boolean',
    ];

    public function chapter()
    {
        return $this->belongsTo(CartelloChapter::class, 'chapter_id');
    }

    public function mcqs()
    {
        return $this->hasMany(CartelloMcq::class, 'page_id')->where('status', true)->orderBy('sort_order', 'asc');
    }
}
