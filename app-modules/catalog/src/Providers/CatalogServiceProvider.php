<?php

namespace Tequia\Catalog\Providers;

use Filament\Panel;
use Illuminate\Support\ServiceProvider;
use Tequia\Catalog\CatalogPlugin;

class CatalogServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        Panel::configureUsing(function (Panel $panel): void {
            if ($panel->getId() === 'app') {
                $panel->plugin(CatalogPlugin::make());
            }
        });
    }
}
