<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    protected $fillable = [
        'url',
        'method',
        'request_data',
        'response_data',
        'status_code',
        'execution_time_ms',
    ];

    /** Keep table at max 500 rows — trim every 50 inserts */
    const MAX_ROWS = 500;

    protected static function booted(): void
    {
        static::created(function () {
            // Only trim occasionally (every ~50 inserts) to reduce DB overhead
            if (random_int(1, 50) === 1) {
                $count = static::count();
                if ($count > self::MAX_ROWS) {
                    $keepIds = static::orderByDesc('id')->limit(self::MAX_ROWS)->pluck('id');
                    static::whereNotIn('id', $keepIds)->delete();
                }
            }
        });
    }
}

