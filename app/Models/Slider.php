<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    protected $fillable = ['title', 'subtitle', 'image_url', 'link_url', 'button_text', 'order_index', 'status'];
}
