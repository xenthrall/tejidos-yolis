<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

if (config('backup.enabled')) {
    foreach (['backup:run' => '02:00', 'backup:clean' => '03:30', 'backup:monitor' => '04:00'] as $command => $time) {
        Schedule::command($command)
            ->dailyAt($time)
            ->timezone('America/Bogota')
            ->environments('production')
            ->withoutOverlapping(360)
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/backup.log'));
    }
}
