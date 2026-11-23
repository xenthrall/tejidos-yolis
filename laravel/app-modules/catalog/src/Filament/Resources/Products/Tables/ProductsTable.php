<?php

namespace Tequia\Catalog\Filament\Resources\Products\Tables;

use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Tequia\Catalog\Enums\ProductStatus;
use Tequia\Catalog\Models\Product;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table->modifyQueryUsing(fn (Builder $query): Builder => $query->with(['images', 'variants', 'category']))
            ->columns([
                ImageColumn::make('cover')->label('Portada')->state(fn (Product $record): ?string => $record->cover()?->url(true))->square(),
                TextColumn::make('name')->label('Producto')->searchable()->sortable()->description(fn (Product $record): ?string => $record->category?->name),
                TextColumn::make('price')->label('Precio')->state(fn (Product $record): string => $record->priceLabel()),
                TextColumn::make('stock')->label('Existencias')->state(fn (Product $record): int => $record->activeVariants()->sum('stock')),
                TextColumn::make('availability')->label('Disponibilidad')->state(fn (Product $record): string => $record->availabilityLabel())->badge()
                    ->color(fn (Product $record): string => $record->isAvailable() ? 'success' : 'gray'),
                TextColumn::make('status')->label('Publicación')->badge(),
                TextColumn::make('updated_at')->label('Actualizado')->dateTime('d/m/Y H:i')->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->label('Publicación')->options(ProductStatus::class),
                SelectFilter::make('category')->label('Categoría')->relationship('category', 'name'),
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('public')->label('Ver producto')->icon('heroicon-o-eye')
                    ->url(fn (Product $record): string => route('storefront.products.show', $record->slug))->openUrlInNewTab()
                    ->visible(fn (Product $record): bool => $record->status === ProductStatus::Published),
                Action::make('archive')->label('Archivar')->icon('heroicon-o-archive-box')->color('warning')->requiresConfirmation()
                    ->authorize('update')->visible(fn (Product $record): bool => $record->status !== ProductStatus::Archived)
                    ->action(fn (Product $record): bool => $record->update(['status' => ProductStatus::Archived])),
            ])->defaultSort('created_at', 'desc')->emptyStateHeading('Tu catálogo comienza aquí')
            ->emptyStateDescription('Crea tu primera pieza, añade sus fotos y publícala cuando esté lista.')
            ->paginated([12, 24, 48]);
    }
}
