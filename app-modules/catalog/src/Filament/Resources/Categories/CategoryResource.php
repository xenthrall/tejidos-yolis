<?php

namespace Tequia\Catalog\Filament\Resources\Categories;

use BackedEnum;
use Filament\Resources\Resource;
use Tequia\Catalog\Filament\Resources\Categories\Pages\CreateCategory;
use Tequia\Catalog\Filament\Resources\Categories\Pages\EditCategory;
use Tequia\Catalog\Filament\Resources\Categories\Pages\ListCategories;
use Tequia\Catalog\Models\Category;
use UnitEnum;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-tag';

    protected static string|UnitEnum|null $navigationGroup = 'Catálogo';

    protected static ?string $navigationLabel = 'Categorías';

    protected static ?string $modelLabel = 'categoría';

    protected static ?string $pluralModelLabel = 'categorías';

    protected static ?string $recordTitleAttribute = 'name';

    protected static ?string $slug = 'categorias';

    public static function getPages(): array
    {
        return ['index' => ListCategories::route('/'), 'create' => CreateCategory::route('/crear'), 'edit' => EditCategory::route('/{record}/editar')];
    }
}
