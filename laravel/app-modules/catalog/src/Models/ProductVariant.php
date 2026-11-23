<?php

namespace Tequia\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

class ProductVariant extends Model
{
    protected $table = 'catalog_product_variants';

    protected $fillable = ['name', 'sku', 'attributes', 'price', 'stock', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['attributes' => 'array', 'price' => 'decimal:2', 'stock' => 'integer', 'is_active' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::saving(function (ProductVariant $variant): void {
            $product = $variant->product;

            if ($product->is_unique && ($variant->stock > 1 || $product->variants()->whereKeyNot($variant->id)->exists())) {
                throw ValidationException::withMessages(['data.variants' => 'Una pieza única solo puede tener una presentación y una unidad.']);
            }

            if (! $product->has_variants && $product->variants()->whereKeyNot($variant->id)->exists()) {
                throw ValidationException::withMessages(['data.variants' => 'Activa las variantes para añadir más presentaciones.']);
            }
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
