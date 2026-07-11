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
}
