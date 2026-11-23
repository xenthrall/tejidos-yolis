<?php

namespace Tequia\Catalog\Filament\Resources\Categories;

use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;
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

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Nombre')->required()->maxLength(120)->live(onBlur: true)
                ->afterStateUpdated(function (?string $state, Set $set, string $operation): void {
                    if ($operation === 'create') {
                        $set('slug', Str::slug($state ?? ''));
                    }
                }),
            TextInput::make('slug')->label('Dirección de la categoría')->required()->maxLength(160)->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->unique(ignoreRecord: true),
            Textarea::make('description')->label('Descripción')->rows(4)->maxLength(3000)->columnSpanFull(),
            TextInput::make('sort_order')->label('Orden')->integer()->minValue(0)->maxValue(2147483647)->default(0)->required(),
            Toggle::make('is_active')->label('Visible en la tienda')->default(true)->helperText('Al desactivarla, sus productos también dejan de mostrarse en la tienda.'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('name')->label('Categoría')->searchable()->sortable(),
            TextColumn::make('products_count')->label('Productos')->counts('products'),
            IconColumn::make('is_active')->label('Visible')->boolean(),
            TextColumn::make('sort_order')->label('Orden')->sortable(),
        ])->recordActions([EditAction::make()])->defaultSort('sort_order')->emptyStateHeading('Organiza tus creaciones')
            ->emptyStateDescription('Añade categorías como ruanas, bolsos, accesorios o decoración.');
    }

    public static function getPages(): array
    {
        return ['index' => ListCategories::route('/'), 'create' => CreateCategory::route('/crear'), 'edit' => EditCategory::route('/{record}/editar')];
    }
}
