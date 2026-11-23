<?php

namespace Tequia\Catalog\Actions;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Tequia\Catalog\Enums\ProductStatus;
use Tequia\Catalog\Models\Product;
use Tequia\Catalog\Support\ImageProcessor;
use Throwable;

class SaveProduct
{
    public function execute(?int $productId, array $input, array $uploads): Product
    {
        $createdFiles = [];

        try {
            return DB::transaction(function () use ($productId, $input, $uploads, &$createdFiles): Product {
                $product = $productId ? Product::query()->lockForUpdate()->findOrFail($productId) : new Product;
                Gate::authorize($productId ? 'update' : 'create', $productId ? $product : Product::class);
                $existingVariants = $product->exists ? $product->variants()->get()->keyBy('id') : collect();
                $existingImages = $product->exists ? $product->images()->get()->keyBy('id') : collect();
                $variants = array_values($input['variants']);

                if ($input['productMode'] !== 'variants') {
                    if (count($variants) > 1) {
                        throw ValidationException::withMessages(['productMode' => 'Conserva una sola variante antes de cambiar al modo sencillo.']);
                    }
                    $selectedId = $variants[0]['id'] ?? null;
                    $first = $selectedId ? $existingVariants->get($selectedId) : $existingVariants->first();
                    if ($selectedId && ! $first) {
                        throw ValidationException::withMessages(['variants' => 'La presentación seleccionada no pertenece a este producto.']);
                    }
                    $variants = [[
                        'id' => $first?->id, 'key' => $variants[0]['key'] ?? 'single',
                        'name' => 'Presentación única', 'sku' => $input['sku'] ?: ($first?->sku ?? 'TY-'.Str::upper(Str::random(10))),
                        'price' => $input['price'], 'stock' => $input['stock'], 'is_active' => true,
                        'attributes' => $first?->attributes ?? [],
                    ]];
                }

                foreach ($variants as &$variant) {
                    $variant['sku'] = trim($variant['sku'] ?? '') ?: 'TY-'.Str::upper(Str::random(10));
                }
                unset($variant);
                $input['variants'] = $variants;
                $input['categoryId'] = $input['categoryId'] ?: null;
                $input['slug'] = trim($input['slug']);
                if ($input['slug'] === '') {
                    $base = Str::slug($input['name']) ?: 'producto';
                    $slug = $base;
                    $suffix = 2;
                    while (Product::query()->where('slug', $slug)->when($product->exists, fn ($query) => $query->whereKeyNot($product->id))->exists()) {
                        $slug = $base.'-'.$suffix++;
                    }
                    $input['slug'] = $slug;
                }

                $rules = [
                    'name' => ['required', 'string', 'max:180'],
                    'slug' => ['required', 'string', 'max:200', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('catalog_products', 'slug')->ignore($product->id)],
                    'categoryId' => ['nullable', 'integer', Rule::exists('catalog_categories', 'id')],
                    'description' => ['nullable', 'string', 'max:12000'],
                    'status' => ['required', Rule::enum(ProductStatus::class)],
                    'isFeatured' => ['boolean'],
                    'productMode' => ['required', Rule::in(['unique', 'simple', 'variants'])],
                    'characteristics' => ['array', 'max:30'],
                    'characteristics.*.name' => ['required', 'string', 'max:100', 'distinct:ignore_case'],
                    'characteristics.*.value' => ['required', 'string', 'max:1000'],
                    'variants' => ['required', 'array', 'min:1', 'max:100'],
                    'variants.*.id' => ['nullable', 'integer', 'distinct', Rule::in($existingVariants->keys()->all())],
                    'variants.*.key' => ['required', 'string', 'max:80', 'distinct'],
                    'variants.*.name' => ['required', 'string', 'max:120'],
                    'variants.*.sku' => ['required', 'string', 'max:100', 'distinct'],
                    'variants.*.price' => ['required', 'numeric', 'min:0', 'max:999999999999.99', 'decimal:0,2'],
                    'variants.*.stock' => ['required', 'integer', 'min:0', 'max:'.($input['productMode'] === 'unique' ? 1 : 2147483647)],
                    'variants.*.is_active' => ['required', 'boolean'],
                    'variants.*.attributes' => ['array', 'max:20'],
                    'variants.*.attributes.*' => ['required', 'string', 'max:300'],
                    'gallery' => ['array', 'max:'.config('catalog.max_images'), 'min:'.($input['status'] === 'published' ? 1 : 0)],
                    'gallery.*.key' => ['required', 'string', 'max:80', 'distinct'],
                    'gallery.*.id' => ['nullable', 'integer', 'distinct', Rule::in($existingImages->keys()->all())],
                    'gallery.*.uploadKey' => ['nullable', 'string', 'distinct', Rule::in(array_keys($uploads))],
                    'gallery.*.variantKey' => ['nullable', 'string', Rule::in(array_column($variants, 'key'))],
                    'newImages' => ['array', 'max:'.config('catalog.max_images')],
                    'newImages.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('catalog.upload_max_kb'), 'dimensions:max_width=5000,max_height=5000'],
                ];
                foreach ($variants as $index => $variant) {
                    $owned = $existingVariants->get($variant['id'] ?? null);
                    $rules['variants.'.$index.'.sku'][] = Rule::unique('catalog_product_variants', 'sku')->ignore($owned?->id);
                }
                Validator::make([...$input, 'newImages' => $uploads], $rules, [
                    'required' => 'El campo :attribute es obligatorio.', 'max' => 'El campo :attribute supera el límite permitido.',
                    'numeric' => 'El campo :attribute debe ser un número.',
                    'integer' => 'El campo :attribute debe ser un número entero.',
                    'min' => 'Revisa el valor mínimo de :attribute.',
                    'slug.unique' => 'La dirección del producto ya está en uso.',
                    'variants.*.sku.unique' => 'La referencia de una variante ya está en uso.',
                    'distinct' => 'Este valor está repetido.', 'gallery.min' => 'Añade al menos una fotografía antes de publicar.',
                    'variants.*.price.decimal' => 'El precio admite como máximo dos decimales.',
                    'newImages.*.dimensions' => 'La foto puede medir hasta 5000 × 5000 píxeles.',
                    'newImages.*.mimes' => 'Usa fotografías JPG, PNG o WebP.',
                    'newImages.*.uploaded' => 'No se pudo leer una fotografía. Quítala de la galería y vuelve a seleccionarla.',
                ], [
                    'name' => 'nombre del producto', 'slug' => 'dirección del producto',
                    'categoryId' => 'categoría', 'description' => 'descripción',
                    'variants.*.name' => 'nombre de la variante', 'variants.*.price' => 'precio',
                    'variants.*.stock' => 'existencias', 'variants.*.sku' => 'referencia',
                    'gallery' => 'fotografías', 'newImages.*' => 'fotografía',
                    'characteristics.*.name' => 'nombre de la característica',
                    'characteristics.*.value' => 'valor de la característica',
                ])->validate();

                foreach ($input['gallery'] as $index => $image) {
                    if ((bool) ($image['id'] ?? null) === (bool) ($image['uploadKey'] ?? null)) {
                        throw ValidationException::withMessages(['gallery' => 'Una fotografía no es válida. Vuelve a seleccionarla.']);
                    }
                }
                if ($input['status'] === 'published' && ! collect($variants)->contains(fn (array $variant): bool => (bool) $variant['is_active'])) {
                    throw ValidationException::withMessages(['variants' => 'Activa al menos una variante para publicar el producto.']);
                }

                $product->fill([
                    'name' => trim($input['name']), 'slug' => $input['slug'], 'category_id' => $input['categoryId'],
                    'description' => trim($input['description']) ?: null, 'status' => $input['status'],
                    'is_unique' => $input['productMode'] === 'unique', 'has_variants' => $input['productMode'] === 'variants',
                    'is_featured' => $input['isFeatured'],
                    'characteristics' => collect($input['characteristics'])->pluck('value', 'name')->all(),
                ])->save();

                $keepVariantIds = array_filter(array_column($variants, 'id'));
                foreach ($existingVariants as $variant) {
                    if (! in_array($variant->id, $keepVariantIds)) {
                        $variant->delete();
                    }
                }
                $variantIds = [];
                foreach ($variants as $order => $data) {
                    $variant = $existingVariants->get($data['id'] ?? null) ?? $product->variants()->make();
                    $variant->fill(Arr::only($data, ['name', 'sku', 'price', 'stock', 'is_active', 'attributes']));
                    $variant->sort_order = $order;
                    $variant->save();
                    $variantIds[$data['key']] = $variant->id;
                }

                $keepImageIds = array_filter(array_column($input['gallery'], 'id'));
                foreach ($existingImages as $image) {
                    if (! in_array($image->id, $keepImageIds)) {
                        $image->delete();
                    }
                }
                foreach ($input['gallery'] as $order => $data) {
                    $image = $existingImages->get($data['id'] ?? null);
                    if (! $image) {
                        $path = app(ImageProcessor::class)->store($uploads[$data['uploadKey']]);
                        $createdFiles[] = $path;
                        $image = $product->images()->make(['path' => $path]);
                    }
                    $image->variant_id = $variantIds[$data['variantKey'] ?? ''] ?? null;
                    $image->sort_order = $order;
                    try {
                        $image->save();
                    } finally {
                        if (! $image->exists || $image->wasRecentlyCreated) {
                            if ($image->thumbnail_path) {
                                $createdFiles[] = $image->thumbnail_path;
                            }
                        }
                    }
                }

                $product->touch();

                return $product;
            });
        } catch (Throwable $exception) {
            if ($createdFiles) {
                rescue(fn () => Storage::disk(config('catalog.disk'))->delete($createdFiles), report: true);
            }
            throw $exception;
        }
    }
}
