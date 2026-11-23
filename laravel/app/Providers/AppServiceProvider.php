<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Tequia\System\Console\Commands\CreateUser;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(base_path('app-modules/app/resources/views'), 'app');
        $this->loadViewsFrom(base_path('app-modules/system/resources/views'), 'system');

        $this->commands([CreateUser::class]);
    }
}
