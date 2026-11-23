<?php

namespace Tequia\Catalog\Filament\Resources\Categories\Pages;

class CreateCategory extends CategoryEditor
{
    protected static ?string $title = 'Nueva categoría';

    public function mount(): void
    {
        $this->authorizeEditor();
        $this->initializeEditor();
    }
}
