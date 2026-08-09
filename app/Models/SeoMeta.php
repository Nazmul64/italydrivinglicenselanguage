<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoMeta extends Model
{
    use HasFactory;

    protected $fillable = [
        'seoable_type',
        'seoable_id',
        'url_path',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'focus_keyword',
        'canonical_url',
        'robots_meta',
        'og_title',
        'og_description',
        'og_image',
        'twitter_title',
        'twitter_description',
        'twitter_image',
        'faq_json',
        'schema_json',
    ];

    protected $casts = [
        'faq_json' => 'array',
        'schema_json' => 'array',
    ];

    public function seoable()
    {
        return $this->morphTo();
    }
}
