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
        'sort_order',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(CartelloCategory::class, 'category_id');
    }

    public function pages()
    {
        return $this->hasMany(CartelloPage::class, 'chapter_id')->orderBy('sort_order', 'asc');
    }
}
