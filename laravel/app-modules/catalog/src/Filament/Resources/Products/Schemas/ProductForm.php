<?php

namespace Tequia\Catalog\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\EditRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Tequia\Catalog\Enums\ProductStatus;
use Tequia\Catalog\Support\ImageProcessor;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('El producto')->schema([
                TextInput::make('name')->label('Nombre')->required()->maxLength(180)->live(onBlur: true)
                    ->afterStateUpdated(function (?string $state, Set $set, string $operation): void {
                        if ($operation === 'create') {
                            $set('slug', Str::slug($state ?? ''));
                        }
                    }),
                TextInput::make('slug')->label('Dirección del producto')->required()->maxLength(200)
                    ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->unique(ignoreRecord: true)
                    ->helperText('Usa letras minúsculas, números y guiones. Evita cambiarla después de compartir el producto.'),
                Select::make('category_id')->label('Categoría')->relationship('category', 'name')->searchable()->preload(),
                Select::make('status')->label('Publicación')->options(ProductStatus::class)->default(ProductStatus::Draft)->required()->live(),
                Textarea::make('description')->label('Descripción')->rows(5)->maxLength(12000)->columnSpanFull(),
                KeyValue::make('characteristics')->label('Características')->keyLabel('Característica')->valueLabel('Valor')
                    ->helperText('Por ejemplo: material, medidas, técnica o cuidados.')->columnSpanFull(),
                Toggle::make('is_featured')->label('Destacar en el inicio')->default(false),
            ])->columns(2)->columnSpanFull(),
            Section::make('Precio y disponibilidad')->description('Las piezas únicas tienen una sola unidad. Publicar y tener existencias son decisiones independientes.')->schema([
                Toggle::make('is_unique')->label('Es una pieza única')->default(true)->live()
                    ->afterStateUpdated(function (bool $state, Set $set): void {
                        if ($state) {
                            $set('has_variants', false);
                        }
                    }),
                Toggle::make('has_variants')->label('Tiene variantes (color, talla u otras)')->default(false)->live()
                    ->disabled(fn (Get $get): bool => (bool) $get('is_unique'))->dehydrated(),
                Repeater::make('variants')->label(fn (Get $get): string => $get('has_variants') ? 'Variantes' : 'Precio y existencias')
                    ->relationship()->orderColumn('sort_order')->defaultItems(1)->minItems(1)
                    ->maxItems(fn (Get $get): ?int => $get('is_unique') || ! $get('has_variants') ? 1 : 100)
                    ->addable(fn (Get $get): bool => (bool) $get('has_variants') && ! $get('is_unique'))
                    ->deletable(fn (Get $get): bool => (bool) $get('has_variants'))
                    ->addActionLabel('Añadir variante')->itemLabel(fn (array $state): string => $state['name'] ?? 'Presentación única')
                    ->schema([
                        TextInput::make('name')->label('Presentación')->default('Presentación única')->required()->maxLength(120),
                        TextInput::make('sku')->label('Referencia')->default(fn (): string => 'TY-'.Str::upper(Str::random(10)))
                            ->required()->maxLength(100)->unique(table: 'catalog_product_variants', column: 'sku', ignoreRecord: true)->distinct(),
                        TextInput::make('price')->label('Precio')->prefix('$')->suffix('COP')->numeric()->minValue(0)->maxValue(999999999999.99)->required(),
                        TextInput::make('stock')->label('Existencias')->integer()->minValue(0)
                            ->maxValue(fn (Get $get): int => $get('../../is_unique') ? 1 : 2147483647)->default(1)->required()
                            ->helperText('0 indica vendida o agotada. El producto puede seguir publicado.'),
                        Toggle::make('is_active')->label('Presentación activa')->default(true),
                        KeyValue::make('attributes')->label('Opciones de la variante')->keyLabel('Opción')->valueLabel('Valor')
                            ->visible(fn (Get $get): bool => (bool) $get('../../has_variants'))->columnSpanFull(),
                    ])->columns(2)->columnSpanFull()
                    ->helperText('Antes de volver a una pieza única o sin variantes, conserva una sola presentación.'),
            ])->columns(2)->columnSpanFull(),
            Section::make('Galería')->description('La primera foto es la portada. Arrastra las fotos para elegirla y ordenar la galería.')->schema([
                Repeater::make('images')->label('Fotografías')->relationship()->orderColumn('sort_order')->defaultItems(0)
                    ->minItems(fn (Get $get): int => in_array($get('status'), [ProductStatus::Published, ProductStatus::Published->value], true) ? 1 : 0)
                    ->maxItems(config('catalog.max_images'))->addActionLabel('Añadir fotografía')->collapsible()
                    ->schema([
                        FileUpload::make('path')->label('Imagen')->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->disk(config('catalog.disk'))->directory('catalog/products')->visibility('public')->required()
                            ->maxSize(config('catalog.upload_max_kb'))->rules(['dimensions:max_width=5000,max_height=5000'])
                            ->imageResizeMode('contain')->imageResizeTargetWidth('1800')->imageResizeTargetHeight('1800')->imageResizeUpscale(false)
                            ->preventFilePathTampering()
                            ->saveUploadedFileUsing(fn (TemporaryUploadedFile $file): string => app(ImageProcessor::class)->store($file)),
                        TextInput::make('alt')->label('Descripción de la fotografía')->maxLength(250)->helperText('Describe lo que se ve para facilitar la accesibilidad.'),
                        Select::make('variant_id')->label('Variante de esta foto (opcional)')->nullable()
                            ->options(fn ($livewire): array => $livewire instanceof EditRecord ? $livewire->getRecord()->variants()->pluck('name', 'id')->all() : [])
                            ->helperText('Después de guardar un producto con variantes puedes asociar sus fotos a cada una.'),
                    ])->columns(1)->columnSpanFull(),
            ])->columnSpanFull(),
        ]);
    }
}
