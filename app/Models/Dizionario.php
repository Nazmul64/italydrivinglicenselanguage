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
}
