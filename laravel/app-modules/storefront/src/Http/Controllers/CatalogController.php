<?php

namespace Tequia\Storefront\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Tequia\Catalog\Models\Category;
use Tequia\Catalog\Models\Product;

class CatalogController extends Controller
{
    private function products(): Builder
    {
        return Product::query()->published()->with(['category', 'images', 'variants']);
    }

    public function home(): View
    {
        $products = $this->products()->orderByDesc('is_featured')->orderByDesc('published_at')->orderByDesc('id')->limit(8)->get();
        $categories = Category::query()->where('is_active', true)
            ->withCount(['products' => fn (Builder $query): Builder => $query->published()])
            ->orderBy('sort_order')->orderBy('name')->get();

        return view('storefront::home', compact('products', 'categories'));
    }

    public function index(Request $request): View
    {
        $validator = Validator::make($request->query(), [
            'q' => ['nullable', 'string', 'max:100'],
            'categoria' => ['nullable', 'string', 'max:160'],
            'disponibilidad' => ['nullable', Rule::in(['disponibles', 'vendidas'])],
            'orden' => ['nullable', Rule::in(['recientes', 'precio-asc', 'precio-desc', 'nombre'])],
        ]);
        abort_if($validator->fails(), 422, 'Los filtros del catálogo no son válidos.');
        $filters = $validator->validated();
        $search = trim($filters['q'] ?? '');
        $category = null;
        $products = $this->products();

        if ($search !== '') {
            $products->where(function (Builder $query) use ($search): void {
                $query->whereLike('name', '%'.$search.'%')->orWhereLike('description', '%'.$search.'%');
            });
        }

        if (! empty($filters['categoria'])) {
            $category = Category::query()->where('is_active', true)->where('slug', $filters['categoria'])->firstOrFail();
            $products->where('category_id', $category->id);
        }

        if (($filters['disponibilidad'] ?? null) === 'disponibles') {
            $products->available();
        } elseif (($filters['disponibilidad'] ?? null) === 'vendidas') {
            $products->whereDoesntHave('variants', fn (Builder $query): Builder => $query->where('is_active', true)->where('stock', '>', 0));
        }

        $products->withMin(['variants as lowest_price' => fn (Builder $query): Builder => $query->where('is_active', true)], 'price');
        match ($filters['orden'] ?? 'recientes') {
            'precio-asc' => $products->orderBy('lowest_price'),
            'precio-desc' => $products->orderByDesc('lowest_price'),
            'nombre' => $products->orderBy('name'),
            default => $products->orderByDesc('published_at'),
        };
        $products = $products->orderByDesc('id')->paginate(12)->withQueryString();
        $categories = Category::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get();

        return view('storefront::products.index', compact('products', 'categories', 'filters', 'category', 'search'));
    }

    public function show(string $slug): View
    {
        $product = $this->products()->where('slug', $slug)->firstOrFail();
        $related = $this->products()->whereKeyNot($product->id)
            ->when($product->category_id, fn (Builder $query): Builder => $query->where('category_id', $product->category_id))
            ->orderByDesc('published_at')->limit(4)->get();
        $variants = $product->activeVariants()->map(fn ($variant): array => [
            'id' => $variant->id,
            'name' => $variant->name,
            'sku' => $variant->sku,
            'price' => '$ '.number_format((float) $variant->price, 2, ',', '.'),
            'stock' => $variant->stock,
            'attributes' => $variant->attributes ?? [],
        ])->values();
        $images = $product->images->map(fn ($image): array => [
            'url' => $image->url(), 'thumbnail' => $image->url(true), 'alt' => $image->alt ?: $product->name, 'variantId' => $image->variant_id,
        ])->values();
        $initialVariant = $product->activeVariants()->firstWhere('stock', '>', 0) ?? $product->activeVariants()->first();
        $whatsapp = 'https://wa.me/'.config('catalog.whatsapp').'?text='.rawurlencode('Hola Yolis, me interesa '.$product->name.'. '.route('storefront.products.show', $product->slug));
        $structuredData = [
            '@context' => 'https://schema.org', '@type' => 'Product', 'name' => $product->name,
            'description' => $product->description ?: $product->name,
            'image' => $images->pluck('url')->all(),
            'brand' => ['@type' => 'Brand', 'name' => 'Tejidos Yolis'],
            'offers' => $product->activeVariants()->map(fn ($variant): array => [
                '@type' => 'Offer', 'sku' => $variant->sku, 'price' => $variant->price, 'priceCurrency' => $variant->currency,
                'availability' => $variant->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'url' => route('storefront.products.show', $product->slug),
            ])->values()->all(),
        ];

        return view('storefront::products.show', compact('product', 'related', 'variants', 'images', 'initialVariant', 'whatsapp', 'structuredData'));
    }
}
