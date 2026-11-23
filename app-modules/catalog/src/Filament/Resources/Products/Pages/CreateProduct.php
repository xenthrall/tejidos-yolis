<?php

namespace Tequia\Catalog\Filament\Resources\Products\Pages;

class CreateProduct extends ProductEditor
{
    protected static ?string $title = 'Nuevo producto';

    public function mount(): void
    {
        $this->authorizeEditor();
        $this->initializeEditor();
    }
}
