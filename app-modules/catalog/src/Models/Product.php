<?php

namespace Tequia\Catalog\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Tequia\Catalog\Database\Factories\ProductFactory;
use Tequia\Catalog\Enums\ProductStatus;

class Product extends Model
{
    use HasFactory;

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }

    protected $table = 'catalog_products';

    protected $fillable = ['category_id', 'name', 'slug', 'description', 'characteristics', 'status', 'is_unique', 'has_variants', 'is_featured'];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'characteristics' => 'array',
            'is_unique' => 'boolean',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
            if ($product->status === ProductStatus::Published && ! $product->published_at) {
                $product->published_at = now();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order')->orderBy('id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ProductStatus::Published)
            ->where(function (Builder $query): void {
                $query->whereNull('category_id')->orWhereHas('category', fn (Builder $category): Builder => $category->where('is_active', true));
            })
            ->whereHas('variants', fn (Builder $variant): Builder => $variant->where('is_active', true));
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->whereHas('variants', fn (Builder $variant): Builder => $variant->where('is_active', true)->where('stock', '>', 0));
    }

    public function activeVariants(): Collection
    {
        return $this->variants->where('is_active', true)->values();
    }

    public function isAvailable(): bool
    {
        return $this->activeVariants()->contains(fn (ProductVariant $variant): bool => $variant->stock > 0);
    }

    public function availabilityLabel(): string
    {
        return $this->isAvailable() ? 'Disponible' : ($this->is_unique ? 'Vendida' : 'Agotado');
    }

    public function priceLabel(): string
    {
        $variants = $this->activeVariants();
        $price = $variants->min('price');

        if ($price === null) {
            return 'Consultar precio';
        }

        return ($variants->max('price') != $price ? 'Desde ' : '').'$ '.number_format((float) $price, 2, ',', '.');
    }

    public function cover(): ?ProductImage
    {
        return $this->images->first();
    }
}
