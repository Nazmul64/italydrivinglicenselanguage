<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PopupPromo extends Model
{
    protected $fillable = ['image_path', 'link_url', 'is_active'];
}
