<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Helpers\ImageHelper;

class HomeCard extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'screen_key',
        'media_type',
        'icon_class',
        'icon_color',
        'order_index',
        'icon_url',
        'image_url',
        'lottie_url',
        'description',
        'link',
        'color',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean',
        'order_index' => 'integer',
    ];

    public function getImageUrlAttribute($value)
    {
        return $value ? ImageHelper::formatImageUrl($value) : null;
    }

    public function getIconUrlAttribute($value)
    {
        return $value ? ImageHelper::formatImageUrl($value) : null;
    }

    public function getLottieUrlAttribute($value)
    {
        return $value ? ImageHelper::formatMediaUrl($value) : null;
    }

    public function getMediaTypeAttribute($value)
    {
        if (!empty($value)) {
            return $value;
        }
        if (!empty($this->attributes['lottie_url'])) {
            return 'lottie';
        }
        if (!empty($this->attributes['image_url']) || !empty($this->attributes['icon_url'])) {
            return 'image';
        }
        return 'icon';
    }
}
