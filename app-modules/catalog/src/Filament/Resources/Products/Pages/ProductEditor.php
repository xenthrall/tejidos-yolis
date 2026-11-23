<?php

namespace Tequia\Catalog\Filament\Resources\Products\Pages;

use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Livewire\WithFileUploads;
use Tequia\Catalog\Actions\SaveProduct;
use Tequia\Catalog\Filament\Concerns\HasCustomCatalogHeader;
use Tequia\Catalog\Filament\Resources\Products\ProductResource;
use Tequia\Catalog\Models\Category;
use Tequia\Catalog\Models\Product;
use Throwable;

abstract class ProductEditor extends Page
{
    use HasCustomCatalogHeader;
    use WithFileUploads;

    protected static string $resource = ProductResource::class;

    protected string $view = 'catalog::filament.products.editor';

    #[Locked]
    public ?int $productId = null;

    public string $name = '';

    public string $productSlug = '';

    public string $description = '';

    public string $categoryId = '';

    public string $status = 'draft';

    public bool $isFeatured = false;

    public string $productMode = 'unique';

    #[Locked]
    public string $previousProductMode = 'unique';

    public string $price = '';

    public string $stock = '1';

    public string $sku = '';

    public array $variants = [];

    public array $characteristics = [];

    public array $gallery = [];

    public array $uploads = [];

    public array $newImages = [];

    public bool $hasUnsavedChanges = false;

    protected function initializeEditor(?Product $product = null): void
    {
        if (! $product) {
            $this->variants = [$this->newVariant()];

            return;
        }
        $this->productId = $product->id;
        $this->name = $product->name;
        $this->productSlug = $product->slug;
        $this->description = $product->description ?? '';
        $this->categoryId = (string) ($product->category_id ?? '');
        $this->status = $product->status->value;
        $this->isFeatured = $product->is_featured;
        $this->productMode = $product->is_unique ? 'unique' : ($product->has_variants ? 'variants' : 'simple');
        $this->previousProductMode = $this->productMode;
        $this->variants = $product->variants->map(fn ($variant): array => [
            'id' => $variant->id, 'key' => 'variant-'.$variant->id, 'name' => $variant->name,
            'sku' => $variant->sku, 'price' => $variant->price, 'stock' => (string) $variant->stock,
            'is_active' => $variant->is_active,
            'attributes' => collect($variant->attributes ?? [])->map(fn ($value, $name): array => ['name' => $name, 'value' => $value])->values()->all(),
        ])->all();
        if (! $this->variants) {
            $this->variants = [$this->newVariant()];
        }
        $this->price = (string) ($this->variants[0]['price'] ?? '');
        $this->stock = (string) ($this->variants[0]['stock'] ?? 1);
        $this->sku = $this->variants[0]['sku'] ?? '';
        $this->characteristics = collect($product->characteristics ?? [])->map(fn ($value, $name): array => ['name' => $name, 'value' => $value])->values()->all();
        $this->gallery = $product->images->map(fn ($image): array => [
            'id' => $image->id, 'key' => 'image-'.$image->id, 'uploadKey' => null,
            'variantKey' => $image->variant_id ? 'variant-'.$image->variant_id : null,
        ])->all();
    }

    public function updated(string $property): void
    {
        if (in_array(Str::before($property, '.'), ['name', 'productSlug', 'description', 'categoryId', 'status', 'isFeatured', 'productMode', 'price', 'stock', 'sku', 'variants', 'characteristics', 'gallery'], true)) {
            $this->hasUnsavedChanges = true;
        }
    }

    public function updatedProductMode(string $mode): void
    {
        $this->resetValidation('productMode');
        if ($mode !== 'variants' && count($this->variants) > 1) {
            $this->productMode = 'variants';
            $this->addError('productMode', 'Conserva una sola variante antes de usar el modo sencillo.');

            return;
        }
        if ($mode === 'variants' && count($this->variants) === 1) {
            $this->variants[0]['price'] = $this->price;
            $this->variants[0]['stock'] = $this->stock;
            $this->variants[0]['sku'] = $this->sku;
        } elseif ($mode !== 'variants' && $this->previousProductMode === 'variants' && $this->variants) {
            $this->price = (string) $this->variants[0]['price'];
            $this->stock = $mode === 'unique' ? (string) min(1, (int) $this->variants[0]['stock']) : (string) $this->variants[0]['stock'];
            $this->sku = $this->variants[0]['sku'];
        }
        if ($mode === 'unique') {
            $this->stock = (string) min(1, max(0, (int) $this->stock));
        }
        $this->previousProductMode = $mode;
    }

    public function updatedUploads(): void
    {
        $this->authorizeEditor();
        $this->resetValidation(['uploads', 'uploads.*', 'gallery']);
        $error = '';
        try {
            $this->validate([
                'uploads' => ['array', 'max:'.max(0, config('catalog.max_images') - count($this->gallery))],
                'uploads.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('catalog.upload_max_kb'), 'dimensions:max_width=5000,max_height=5000'],
            ], [
                'uploads.max' => 'Puedes añadir hasta '.config('catalog.max_images').' fotografías por producto.',
                'uploads.*.mimes' => 'Usa imágenes JPG, PNG o WebP.',
                'uploads.*.max' => 'Cada fotografía puede pesar hasta '.(config('catalog.upload_max_kb') / 1024).' MB.',
                'uploads.*.image' => 'Selecciona una fotografía válida.',
                'uploads.*.uploaded' => 'No se pudo leer una fotografía. Vuelve a seleccionarla.',
                'uploads.*.dimensions' => 'La foto puede medir hasta 5000 × 5000 píxeles.',
            ]);
            foreach ($this->uploads as $file) {
                $key = (string) Str::ulid();
                $this->newImages[$key] = $file;
                $this->gallery[] = ['id' => null, 'key' => $key, 'uploadKey' => $key, 'variantKey' => null];
                $this->hasUnsavedChanges = true;
            }
        } catch (ValidationException $exception) {
            $error = $exception->validator->errors()->first();
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            $error = 'No se pudieron preparar las fotografías. Vuelve a seleccionarlas.';
            $this->addError('uploads', $error);
        } finally {
            $this->uploads = [];
            $this->dispatch('catalog-photos-processed', editorId: $this->getId(), error: $error);
        }
    }

    public function movePhoto(string $key, int $position): void
    {
        $index = array_search($key, array_column($this->gallery, 'key'), true);
        if ($index === false) {
            return;
        }
        $item = array_splice($this->gallery, $index, 1)[0];
        array_splice($this->gallery, max(0, min($position, count($this->gallery))), 0, [$item]);
        $this->hasUnsavedChanges = true;
    }

    public function removePhoto(string $key): void
    {
        $this->gallery = array_values(array_filter($this->gallery, fn (array $image): bool => $image['key'] !== $key));
        unset($this->newImages[$key]);
        $this->resetValidation(['newImages.'.$key, 'gallery', 'gallery.*']);
        $this->hasUnsavedChanges = true;
    }

    public function addVariant(): void
    {
        if (count($this->variants) < 100) {
            $this->variants[] = $this->newVariant();
            $this->hasUnsavedChanges = true;
        }
    }

    public function removeVariant(string $key): void
    {
        if (count($this->variants) <= 1) {
            return;
        }
        $this->variants = array_values(array_filter($this->variants, fn (array $variant): bool => $variant['key'] !== $key));
        $this->hasUnsavedChanges = true;
        foreach ($this->gallery as &$image) {
            if (($image['variantKey'] ?? null) === $key) {
                $image['variantKey'] = null;
            }
        }
    }

    public function addCharacteristic(): void
    {
        if (count($this->characteristics) < 30) {
            $this->characteristics[] = ['name' => '', 'value' => ''];
            $this->hasUnsavedChanges = true;
        }
    }

    public function removeCharacteristic(int $index): void
    {
        unset($this->characteristics[$index]);
        $this->characteristics = array_values($this->characteristics);
        $this->hasUnsavedChanges = true;
    }

    public function addVariantAttribute(int $index): void
    {
        if (isset($this->variants[$index]) && count($this->variants[$index]['attributes']) < 20) {
            $this->variants[$index]['attributes'][] = ['name' => '', 'value' => ''];
            $this->hasUnsavedChanges = true;
        }
    }

    public function removeVariantAttribute(int $index, int $attribute): void
    {
        unset($this->variants[$index]['attributes'][$attribute]);
        $this->variants[$index]['attributes'] = array_values($this->variants[$index]['attributes']);
        $this->hasUnsavedChanges = true;
    }

    public function save(): void
    {
        $this->authorizeEditor();
        try {
            $this->persistProduct();
        } catch (ValidationException $exception) {
            $this->dispatch('catalog-editor-invalid', editorId: $this->getId());
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            $this->addError('save', 'No se pudo guardar el producto. Tus cambios siguen en el formulario; inténtalo de nuevo.');
            $this->dispatch('catalog-editor-invalid', editorId: $this->getId());
        }
    }

    protected function persistProduct(): void
    {
        $this->authorizeEditor();
        if ($this->uploads) {
            $this->addError('gallery', 'Espera a que terminen de cargar las fotografías.');
            $this->dispatch('catalog-editor-invalid', editorId: $this->getId());

            return;
        }
        $variants = $this->variants;
        foreach ($variants as $index => &$variant) {
            $attributes = array_values(array_filter($variant['attributes'], fn (array $attribute): bool => trim($attribute['name']) !== '' || trim($attribute['value']) !== ''));
            foreach ($attributes as $attribute) {
                if (trim($attribute['name']) === '' || trim($attribute['value']) === '') {
                    throw ValidationException::withMessages(['variants.'.$index.'.attributes' => 'Completa el nombre y el valor de cada opción.']);
                }
            }
            if (count(array_unique(array_column($attributes, 'name'))) !== count($attributes)) {
                throw ValidationException::withMessages(['variants.'.$index.'.attributes' => 'No repitas el nombre de las opciones.']);
            }
            $variant['attributes'] = collect($attributes)->pluck('value', 'name')->all();
        }
        unset($variant);
        $input = [
            'name' => $this->name, 'slug' => $this->productSlug, 'description' => $this->description,
            'categoryId' => $this->categoryId, 'status' => $this->status, 'isFeatured' => $this->isFeatured,
            'productMode' => $this->productMode, 'price' => $this->price, 'stock' => $this->stock, 'sku' => $this->sku,
            'variants' => $variants, 'gallery' => $this->gallery,
            'characteristics' => array_values(array_filter($this->characteristics, fn (array $item): bool => trim($item['name']) !== '' || trim($item['value']) !== '')),
        ];
        app(SaveProduct::class)->execute($this->productId, $input, $this->newImages);
        Notification::make()->success()->title($this->productId ? 'Cambios guardados' : 'Producto creado')->send();
        $this->redirect(ProductResource::getUrl('index'));
    }

    protected function authorizeEditor(): void
    {
        Gate::authorize($this->productId ? 'update' : 'create', $this->productId ? Product::findOrFail($this->productId) : Product::class);
    }

    protected function getViewData(): array
    {
        $this->authorizeEditor();
        $existing = $this->productId ? Product::findOrFail($this->productId)->images()->get()->keyBy('id') : collect();
        $galleryItems = [];
        foreach ($this->gallery as $image) {
            $saved = $existing->get($image['id'] ?? null);
            $upload = $this->newImages[$image['uploadKey'] ?? ''] ?? null;
            $preview = $saved?->url(true);
            if (! $preview && $upload instanceof TemporaryUploadedFile) {
                try {
                    $preview = $upload->temporaryUrl();
                } catch (Throwable) {
                    $preview = null;
                }
            }
            $galleryItems[] = [...$image, 'preview' => $preview];
        }

        return ['categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(), 'galleryItems' => $galleryItems];
    }

    private function newVariant(): array
    {
        return ['id' => null, 'key' => (string) Str::ulid(), 'name' => '', 'sku' => '', 'price' => '', 'stock' => '1', 'is_active' => true, 'attributes' => []];
    }
}
