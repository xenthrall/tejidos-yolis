<?php

namespace Tequia\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tequia\Catalog\Support\ImageProcessor;

class ProductImage extends Model
{
    protected $table = 'catalog_product_images';

    protected $fillable = ['path', 'alt', 'variant_id', 'sort_order'];

    protected static function booted(): void
    {
        static::saving(function (ProductImage $image): void {
            if ($image->variant_id && ! $image->product->variants()->whereKey($image->variant_id)->exists()) {
                throw ValidationException::withMessages(['data.images' => 'La fotografía debe corresponder a una variante de este producto.']);
            }

            if (! $image->exists || $image->isDirty('path')) {
                $image->disk = config('catalog.disk');
                $image->thumbnail_path = app(ImageProcessor::class)->thumbnail($image->path, $image->disk);
            }
        });

        static::updated(function (ProductImage $image): void {
            if ($image->wasChanged('path')) {
                $disk = $image->getRawOriginal('disk');
                $paths = array_filter([$image->getRawOriginal('path'), $image->getRawOriginal('thumbnail_path')]);
                DB::afterCommit(fn () => Storage::disk($disk)->delete($paths));
            }
        });

        static::deleted(function (ProductImage $image): void {
            $paths = array_filter([$image->path, $image->thumbnail_path]);
            DB::afterCommit(fn () => Storage::disk($image->disk)->delete($paths));
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function url(bool $thumbnail = false): string
    {
        return Storage::disk($this->disk)->url($thumbnail ? ($this->thumbnail_path ?: $this->path) : $this->path);
    }
}
