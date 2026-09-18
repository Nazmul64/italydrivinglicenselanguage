<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartelloChapter extends Model
{
    protected $table = 'cartello_chapters';

    protected $fillable = [
        'category_id',
        'name',
        'bn_name',
        'chapter_number',
        'image',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function getImageAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatImageUrl($value);
    }

    public function category()
    {
        return $this->belongsTo(CartelloCategory::class, 'category_id');
    }

    public function pages()
    {
        return $this->hasMany(CartelloPage::class, 'chapter_id')->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }
}
