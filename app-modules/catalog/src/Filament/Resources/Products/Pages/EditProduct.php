<?php

namespace Tequia\Catalog\Filament\Resources\Products\Pages;

use Tequia\Catalog\Models\Product;

class EditProduct extends ProductEditor
{
    protected static ?string $title = 'Editar producto';

    public function mount(int|string $record): void
    {
        $product = Product::with(['variants', 'images'])->findOrFail($record);
        $this->productId = $product->id;
        $this->authorizeEditor();
        $this->initializeEditor($product);
    }
}
