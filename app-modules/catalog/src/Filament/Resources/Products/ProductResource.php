<?php

namespace Tequia\Catalog\Filament\Resources\Products;

use BackedEnum;
use Filament\Resources\Resource;
use Tequia\Catalog\Filament\Resources\Products\Pages\CreateProduct;
use Tequia\Catalog\Filament\Resources\Products\Pages\EditProduct;
use Tequia\Catalog\Filament\Resources\Products\Pages\ListProducts;
use Tequia\Catalog\Models\Product;
use UnitEnum;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-shopping-bag';

    protected static string|UnitEnum|null $navigationGroup = 'Catálogo';

    protected static ?string $navigationLabel = 'Productos';

    protected static ?string $modelLabel = 'producto';

    protected static ?string $pluralModelLabel = 'productos';

    protected static ?string $recordTitleAttribute = 'name';

    protected static ?string $slug = 'productos';

    public static function getPages(): array
    {
        return ['index' => ListProducts::route('/'), 'create' => CreateProduct::route('/crear'), 'edit' => EditProduct::route('/{record}/editar')];
    }
}
