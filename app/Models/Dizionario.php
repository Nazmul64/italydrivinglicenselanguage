<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dizionario extends Model
{
    protected $table = 'dizionaros';

    protected $fillable = [
        'word',
        'bn',
        'desc_it',
        'desc_bn',
        'image',
        'audio',
        'video',
    ];

    public function getImageAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatImageUrl($value);
    }

    public function getAudioAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }

    public function getVideoAttribute($value)
    {
        return \App\Helpers\ImageHelper::formatMediaUrl($value);
    }
}
