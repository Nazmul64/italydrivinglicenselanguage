<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeCard extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'screen_key',
        'icon_class',
        'icon_color',
        'order_index',
        'icon_url',
        'description',
        'link',
        'color',
        'status'
    ];
}
