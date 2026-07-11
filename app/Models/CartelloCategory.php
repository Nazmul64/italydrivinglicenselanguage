<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartelloCategory extends Model
{
    protected $table = 'cartello_categories';

    protected $fillable = [
        'name',
        'bn_name',
        'description',
        'bn_description',
        'sort_order',
        'status',
    ];

    public function chapters()
    {
        return $this->hasMany(CartelloChapter::class, 'category_id')->orderBy('sort_order', 'asc');
    }
}
