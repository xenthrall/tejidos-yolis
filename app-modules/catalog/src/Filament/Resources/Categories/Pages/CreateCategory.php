<?php

namespace Tequia\Catalog\Filament\Resources\Categories\Pages;

use Filament\Resources\Pages\CreateRecord;
use Tequia\Catalog\Filament\Resources\Categories\CategoryResource;

class CreateCategory extends CreateRecord
{
    protected static string $resource = CategoryResource::class;

    protected function getRedirectUrl(): string
    {
        return CategoryResource::getUrl('index');
    }
}
