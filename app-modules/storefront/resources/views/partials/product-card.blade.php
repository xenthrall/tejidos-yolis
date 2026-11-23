<article class="sf-product-card">
    <a class="sf-product-image" href="{{ route('storefront.products.show', $product->slug) }}" aria-label="Ver {{ $product->name }}">
        @if ($product->cover())
            <img src="{{ $product->cover()->url(true) }}" alt="{{ $product->cover()->alt ?: $product->name }}" loading="lazy" width="640" height="800" decoding="async">
        @else
            <div class="sf-image-placeholder"><img src="{{ asset('brand/logo.svg') }}" alt="" width="100" height="80"><span>Tejidos Yolis</span></div>
        @endif
        <span class="sf-card-view">Ver pieza @include('storefront::partials.icon', ['icon' => 'plus'])</span>
        @if (! $product->isAvailable())<span class="sf-badge sf-badge-muted">{{ $product->availabilityLabel() }}</span>
        @elseif ($product->is_unique)<span class="sf-badge">Pieza única</span>@endif
    </a>
    <div class="sf-card-meta"><span>{{ $product->category?->name ?? 'Hecho a mano' }}</span><span>{{ $product->images->count() }} {{ $product->images->count() === 1 ? 'foto' : 'fotos' }}</span></div>
    <h3><a href="{{ route('storefront.products.show', $product->slug) }}">{{ $product->name }}</a></h3>
    <p class="sf-card-price">{{ $product->priceLabel() }} <small>COP</small></p>
</article>
