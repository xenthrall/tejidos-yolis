<?php

namespace Tequia\Catalog;

use Filament\Contracts\Plugin;
use Filament\Panel;

class CatalogPlugin implements Plugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public function getId(): string
    {
        return 'tequia-catalog';
    }

    public function register(Panel $panel): void
    {
        $panel->discoverResources(in: __DIR__.'/Filament/Resources', for: 'Tequia\\Catalog\\Filament\\Resources');
    }

    public function boot(Panel $panel): void {}
}
