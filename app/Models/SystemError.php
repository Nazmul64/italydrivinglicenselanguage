<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemError extends Model
{
    protected $fillable = [
        'reference_id',
        'message',
        'exception_type',
        'file',
        'line',
        'function',
        'controller',
        'route',
        'middleware',
        'method',
        'url',
        'status_code',
        'stack_trace',
        'sql_error',
        'user_id',
        'user_name',
        'ip_address',
        'browser',
        'os',
    ];

    protected $casts = [
        'middleware' => 'array',
        'sql_error' => 'array',
    ];
}
