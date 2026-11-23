@extends('storefront::layout')
@section('title', $product->name.' · Tejidos Yolis')
@section('description', \Illuminate\Support\Str::limit($product->description ?: $product->name, 160))
@section('og-type', 'product')
@section('og-image', $product->cover()?->url() ?? asset('brand/logo.svg'))
@push('head')<script type="application/ld+json">@json($structuredData)</script>@endpush
@section('content')
<div class="sf-shell sf-breadcrumbs"><a href="{{ route('home') }}">Inicio</a><span>/</span><a href="{{ route('storefront.products.index') }}">Catálogo</a><span>/</span><span>{{ $product->name }}</span></div>
<section class="sf-shell sf-product-detail" data-product-detail>
    <script type="application/json" data-product-config>@json($productConfig)</script>
    @include('storefront::partials.product-gallery', ['product' => $product])
    <div class="sf-product-info">
        <span class="sf-eyebrow">{{ $product->category?->name ?? 'Creación artesanal' }}</span>
        <h1>{{ $product->name }}</h1>
        <div class="sf-detail-badges">@if ($product->is_unique)<span class="sf-pill">Pieza única</span>@endif<span class="sf-pill {{ $product->isAvailable() ? 'sf-pill-green' : '' }}" data-availability aria-live="polite">{{ $product->availabilityLabel() }}</span></div>
        <p class="sf-detail-price"><span data-price>{{ $initialVariant ? '$ '.number_format((float) $initialVariant->price, 2, ',', '.') : $product->priceLabel() }}</span> <small>COP</small></p>
        @if ($product->description)<p class="sf-product-description">{{ $product->description }}</p>@endif
        @if ($product->has_variants && $variants->count() > 1)
            <div class="sf-field sf-variant-picker"><label for="variante">Elige una presentación</label><select id="variante" data-variant-select>@foreach ($product->activeVariants() as $variant)<option value="{{ $variant->id }}" @selected($variant->id === $initialVariant?->id)>{{ $variant->name }}{{ $variant->stock < 1 ? ' · Agotada' : '' }}</option>@endforeach</select></div>
        @endif
        <dl class="sf-variant-attributes" data-variant-attributes>@foreach (($initialVariant?->attributes ?? []) as $name => $value)<div><dt>{{ $name }}</dt><dd>{{ $value }}</dd></div>@endforeach</dl>
        <p class="sf-stock-note" data-stock-note aria-live="polite">{{ $product->isAvailable() ? ($product->is_unique ? 'Solo hay una pieza como esta.' : 'Consulta con Yolis la cantidad que necesitas.') : 'Esta pieza ya no está disponible. Puedes consultar por otras creaciones.' }}</p>
        <a class="sf-button sf-whatsapp-button" href="{{ $whatsapp }}" data-whatsapp @if (! $product->isAvailable()) hidden @endif target="_blank" rel="noopener noreferrer">@include('storefront::partials.icon', ['icon' => 'chat'])<span>Consultar esta pieza</span></a>
        <a class="sf-button sf-button-outline" href="{{ route('storefront.products.index', ['disponibilidad' => 'disponibles']) }}" data-other-products @if ($product->isAvailable()) hidden @endif>Explorar piezas disponibles</a>
        <p class="sf-purchase-note">Conversa por WhatsApp directamente con Yolis para confirmar los detalles de la pieza y coordinar tu pedido.</p>
        @if ($product->characteristics)
            <section class="sf-characteristics"><h2>Los detalles importan</h2><dl>@foreach ($product->characteristics as $name => $value)<div><dt>{{ $name }}</dt><dd>{{ $value }}</dd></div>@endforeach</dl></section>
        @endif
        <p class="sf-reference">Referencia de esta pieza: <span data-sku>{{ $initialVariant?->sku }}</span></p>
    </div>
</section>
@if ($related->isNotEmpty())<section class="sf-shell sf-section"><div class="sf-section-heading"><div><span class="sf-eyebrow">Sigue explorando</span><h2>Otras piezas con historia</h2></div></div><div class="sf-product-grid">@foreach ($related as $item)@include('storefront::partials.product-card', ['product' => $item])@endforeach</div></section>@endif
@endsection
