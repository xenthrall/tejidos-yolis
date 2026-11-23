<?php

namespace Tequia\Catalog\Filament\Resources\Categories\Pages;

use Tequia\Catalog\Models\Category;

class EditCategory extends CategoryEditor
{
    protected static ?string $title = 'Editar categoría';

    public function mount(int|string $record): void
    {
        $category = Category::findOrFail($record);
        $this->categoryId = $category->id;
        $this->authorizeEditor();
        $this->initializeEditor($category);
    }
}
