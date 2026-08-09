<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-prune database daily at 2am to keep SQLite under 20MB
Schedule::command('db:prune')->dailyAt('02:00')->withoutOverlapping();
