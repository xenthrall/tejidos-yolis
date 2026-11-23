@extends('storefront::layout')

@section('content')
<section class="sf-shell sf-hero">
    <div class="sf-hero-copy">
        <span class="sf-eyebrow">Creaciones de Boyacá</span>
        <h1>Hecho a mano.<br><em>Hecho para ti.</em></h1>
        <p>Piezas que abrigan y cuentan historias. Descubre las creaciones de Tejidos Yolis y encuentra esa que se siente tuya.</p>
        <div class="sf-hero-actions"><a class="sf-button" href="{{ route('storefront.products.index') }}">Explorar el catálogo</a><a class="sf-text-link" href="{{ route('storefront.about') }}">Conoce nuestra historia</a></div>
        <div class="sf-hero-note"><span class="sf-thread-mark" aria-hidden="true">✳</span> Cada pieza tiene su propio carácter.</div>
    </div>
    <div class="sf-hero-art">
        @if ($products->first()?->cover())
            <a href="{{ route('storefront.products.show', $products->first()->slug) }}" class="sf-hero-photo"><img src="{{ $products->first()->cover()->url() }}" alt="{{ $products->first()->cover()->alt ?: $products->first()->name }}" width="900" height="1100" fetchpriority="high"></a>
            <div class="sf-hero-caption"><span>Una creación de Yolis</span><strong>{{ $products->first()->name }}</strong></div>
        @else
            <div class="sf-woven-art" aria-hidden="true"><div class="sf-woven-cloth"></div><img src="{{ asset('brand/logo.svg') }}" alt="" width="180" height="145"></div>
            <div class="sf-hero-caption"><span>Tiempo, oficio y cariño</span><strong>El arte de crear con las manos</strong></div>
        @endif
        <span class="sf-hero-seal">Con alma<br>artesanal</span>
    </div>
</section>
<div class="sf-values"><div class="sf-shell"><span>Hecho a mano</span><span>Detalles que hacen la diferencia</span><span>Contacto directo con su creadora</span></div></div>
<section class="sf-shell sf-section">
    <div class="sf-section-heading"><div><span class="sf-eyebrow">Elige algo especial</span><h2>Nuestras creaciones</h2></div><a class="sf-text-link" href="{{ route('storefront.products.index') }}">Ver todo el catálogo</a></div>
    @if ($categories->contains(fn ($category) => $category->products_count > 0))
        <div class="sf-category-links"><a class="is-active" href="{{ route('storefront.products.index') }}">Todas las piezas</a>@foreach ($categories->where('products_count', '>', 0) as $category)<a href="{{ route('storefront.products.index', ['categoria' => $category->slug]) }}">{{ $category->name }}</a>@endforeach</div>
    @endif
    <div class="sf-product-grid">
        @forelse ($products as $product)
            @include('storefront::partials.product-card', ['product' => $product])
        @empty
            <div class="sf-empty"><img src="{{ asset('brand/logo.svg') }}" alt="" width="110" height="90"><h3>Estamos preparando nuevas creaciones</h3><p>Muy pronto encontrarás nuestras piezas aquí. Mientras tanto, puedes conversar con Yolis.</p><a class="sf-button" href="https://wa.me/{{ config('catalog.whatsapp') }}" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a></div>
        @endforelse
    </div>
</section>
<section class="sf-story-band"><div class="sf-shell sf-story-inner"><span class="sf-eyebrow">De nuestras manos a las tuyas</span><h2>Lo especial se crea<br><em>sin prisa.</em></h2><p>Detrás de cada creación hay dedicación y atención a los detalles. Nos gusta que puedas conocer la pieza, preguntar y elegir con tranquilidad.</p><a class="sf-button sf-button-light" href="{{ route('storefront.contact') }}">Conversemos</a></div></section>
@endsection
