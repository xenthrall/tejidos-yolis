<?php

namespace Tequia\Catalog\Filament\Resources\Products\Pages;

use Filament\Resources\Pages\CreateRecord;
use Tequia\Catalog\Filament\Resources\Products\ProductResource;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    protected ?bool $hasDatabaseTransactions = true;

    protected function getRedirectUrl(): string
    {
        return ProductResource::getUrl('index');
    }
}
