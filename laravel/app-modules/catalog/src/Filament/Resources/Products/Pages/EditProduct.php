<?php

namespace Tequia\Catalog\Filament\Resources\Products\Pages;

use Filament\Resources\Pages\EditRecord;
use Tequia\Catalog\Filament\Resources\Products\ProductResource;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected ?bool $hasDatabaseTransactions = true;

    protected function getRedirectUrl(): string
    {
        return ProductResource::getUrl('index');
    }
}
