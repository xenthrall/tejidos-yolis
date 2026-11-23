@extends('storefront::layout')
@section('title', ($category?->name ?? 'Catálogo').' · Tejidos Yolis')
@section('content')
@php
    $activeFilterCount = (filled($search) ? 1 : 0)
        + (filled($filters['categoria'] ?? null) ? 1 : 0)
        + (filled($filters['disponibilidad'] ?? null) ? 1 : 0)
        + (($filters['orden'] ?? 'recientes') !== 'recientes' ? 1 : 0);
@endphp
<section class="sf-shell sf-page-intro"><span class="sf-eyebrow">La colección de Yolis</span><h1>{{ $category?->name ?? 'Encuentra tu próxima pieza' }}</h1><p>{{ $category?->description ?: 'Texturas, colores y creaciones con carácter. Explora con calma y elige esa que se siente tuya.' }}</p></section>
<section class="sf-shell sf-catalog-section">
    @if ($categories->isNotEmpty())
        <nav class="sf-category-links sf-catalog-categories" aria-label="Explorar por categoría"><a href="{{ route('storefront.products.index', \Illuminate\Support\Arr::except($filters, 'categoria')) }}" @class(['is-active' => ! $category])>Todas las piezas</a>@foreach ($categories as $item)<a href="{{ route('storefront.products.index', [...$filters, 'categoria' => $item->slug]) }}" @class(['is-active' => $category?->id === $item->id])>{{ $item->name }}</a>@endforeach</nav>
    @endif
    <details class="sf-filter-panel" data-filter-panel open>
        <summary><span>@include('storefront::partials.icon', ['icon' => 'filters'])Buscar y filtrar @if ($activeFilterCount)<small>{{ $activeFilterCount }}</small>@endif</span>@include('storefront::partials.icon', ['icon' => 'plus'])</summary>
        <form class="sf-filters" action="{{ route('storefront.products.index') }}" method="get" role="search">
            <div class="sf-field sf-search-field"><label for="buscar">Buscar una pieza</label><div class="sf-search-input">@include('storefront::partials.icon', ['icon' => 'search'])<input id="buscar" type="search" name="q" placeholder="Nombre, material, inspiración…" maxlength="100" value="{{ $search }}"></div></div>
            <div class="sf-field"><label for="categoria">Categoría</label><select id="categoria" name="categoria"><option value="">Todas las categorías</option>@foreach ($categories as $item)<option value="{{ $item->slug }}" @selected(($filters['categoria'] ?? '') === $item->slug)>{{ $item->name }}</option>@endforeach</select></div>
            <div class="sf-field"><label for="disponibilidad">Disponibilidad</label><select id="disponibilidad" name="disponibilidad"><option value="">Todas las piezas</option><option value="disponibles" @selected(($filters['disponibilidad'] ?? '') === 'disponibles')>Disponibles</option><option value="vendidas" @selected(($filters['disponibilidad'] ?? '') === 'vendidas')>Vendidas o agotadas</option></select></div>
            <div class="sf-field"><label for="orden">Ordenar por</label><select id="orden" name="orden"><option value="recientes" @selected(($filters['orden'] ?? 'recientes') === 'recientes')>Más recientes</option><option value="precio-asc" @selected(($filters['orden'] ?? '') === 'precio-asc')>Menor precio</option><option value="precio-desc" @selected(($filters['orden'] ?? '') === 'precio-desc')>Mayor precio</option><option value="nombre" @selected(($filters['orden'] ?? '') === 'nombre')>Nombre</option></select></div>
            <button class="sf-button" type="submit">Aplicar filtros</button>
        </form>
    </details>
    @if ($errors->any())<p class="sf-form-error" role="alert">Revisa los filtros: {{ $errors->first() }}</p>@endif
    <div class="sf-results-meta"><p><strong>{{ $products->total() }}</strong> {{ $products->total() === 1 ? 'pieza por descubrir' : 'piezas por descubrir' }}@if ($search) para «{{ $search }}»@endif</p>@if ($activeFilterCount)<a class="sf-text-link" href="{{ route('storefront.products.index') }}">Limpiar filtros</a>@endif</div>
    @if ($activeFilterCount)
        <div class="sf-active-filters" aria-label="Filtros aplicados">
            @if ($search)<a href="{{ route('storefront.products.index', \Illuminate\Support\Arr::except($filters, 'q')) }}" aria-label="Quitar búsqueda {{ $search }}">«{{ $search }}» @include('storefront::partials.icon', ['icon' => 'close'])</a>@endif
            @if ($category)<a href="{{ route('storefront.products.index', \Illuminate\Support\Arr::except($filters, 'categoria')) }}" aria-label="Quitar categoría {{ $category->name }}">{{ $category->name }} @include('storefront::partials.icon', ['icon' => 'close'])</a>@endif
            @if ($filters['disponibilidad'] ?? null)<a href="{{ route('storefront.products.index', \Illuminate\Support\Arr::except($filters, 'disponibilidad')) }}">{{ $filters['disponibilidad'] === 'disponibles' ? 'Disponibles' : 'Vendidas o agotadas' }} @include('storefront::partials.icon', ['icon' => 'close'])</a>@endif
            @if (($filters['orden'] ?? 'recientes') !== 'recientes')<a href="{{ route('storefront.products.index', \Illuminate\Support\Arr::except($filters, 'orden')) }}">Orden personalizado @include('storefront::partials.icon', ['icon' => 'close'])</a>@endif
        </div>
    @endif
    <div class="sf-product-grid">
        @forelse ($products as $product)
            @include('storefront::partials.product-card', ['product' => $product])
        @empty
            <div class="sf-empty"><span class="sf-empty-symbol">@include('storefront::partials.icon', ['icon' => 'search'])</span><h2>No encontramos piezas con esos filtros</h2><p>Prueba otra búsqueda o déjate sorprender por el catálogo completo.</p><a class="sf-button" href="{{ route('storefront.products.index') }}">Ver todas las piezas</a></div>
        @endforelse
    </div>
    @if ($products->hasPages())<div class="sf-pagination">{{ $products->links() }}</div>@endif
</section>
@endsection
