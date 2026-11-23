<?php

namespace Tequia\Catalog\Filament\Concerns;

trait HasCustomCatalogHeader
{
    public function getHeading(): string
    {
        return '';
    }

    public function getBreadcrumbs(): array
    {
        return [];
    }
}
