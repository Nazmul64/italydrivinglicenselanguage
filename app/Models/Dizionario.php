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

    protected static function booted()
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');
            \Illuminate\Support\Facades\Cache::forget('all_compiled_mcq_vocabulary');
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('frontend_cached_view_data');
            \Illuminate\Support\Facades\Cache::forget('all_compiled_mcq_vocabulary');
        });
    }
}
