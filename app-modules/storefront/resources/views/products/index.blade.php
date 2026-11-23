@extends('storefront::layout')
@section('title', ($category?->name ?? 'Catálogo').' · Tejidos Yolis')
@section('content')
<section class="sf-shell sf-page-intro"><span class="sf-eyebrow">Tejidos Yolis</span><h1>{{ $category?->name ?? 'Piezas para descubrir' }}</h1><p>{{ $category?->description ?: 'Explora nuestras creaciones y encuentra algo que conecte contigo.' }}</p></section>
<section class="sf-shell sf-catalog-section">
    <form class="sf-filters" action="{{ route('storefront.products.index') }}" method="get" role="search">
        <div class="sf-field sf-search-field"><label for="buscar">Buscar una pieza</label><input id="buscar" type="search" name="q" placeholder="¿Qué estás buscando?" maxlength="100" value="{{ $search }}"></div>
        <div class="sf-field"><label for="categoria">Categoría</label><select id="categoria" name="categoria"><option value="">Todas las categorías</option>@foreach ($categories as $item)<option value="{{ $item->slug }}" @selected(($filters['categoria'] ?? '') === $item->slug)>{{ $item->name }}</option>@endforeach</select></div>
        <div class="sf-field"><label for="disponibilidad">Disponibilidad</label><select id="disponibilidad" name="disponibilidad"><option value="">Todas las piezas</option><option value="disponibles" @selected(($filters['disponibilidad'] ?? '') === 'disponibles')>Disponibles</option><option value="vendidas" @selected(($filters['disponibilidad'] ?? '') === 'vendidas')>Vendidas o agotadas</option></select></div>
        <div class="sf-field"><label for="orden">Ordenar por</label><select id="orden" name="orden"><option value="recientes" @selected(($filters['orden'] ?? 'recientes') === 'recientes')>Más recientes</option><option value="precio-asc" @selected(($filters['orden'] ?? '') === 'precio-asc')>Menor precio</option><option value="precio-desc" @selected(($filters['orden'] ?? '') === 'precio-desc')>Mayor precio</option><option value="nombre" @selected(($filters['orden'] ?? '') === 'nombre')>Nombre</option></select></div>
        <button class="sf-button" type="submit">Buscar</button>
    </form>
    @if ($errors->any())<p class="sf-form-error" role="alert">Revisa los filtros: {{ $errors->first() }}</p>@endif
    <div class="sf-results-meta"><p>{{ $products->total() }} {{ $products->total() === 1 ? 'pieza encontrada' : 'piezas encontradas' }}@if ($search) para «{{ $search }}»@endif</p>@if (array_filter($filters))<a class="sf-text-link" href="{{ route('storefront.products.index') }}">Limpiar filtros</a>@endif</div>
    <div class="sf-product-grid">
        @forelse ($products as $product)
            @include('storefront::partials.product-card', ['product' => $product])
        @empty
            <div class="sf-empty"><h2>No encontramos piezas con esos filtros</h2><p>Prueba otra búsqueda o explora el catálogo completo.</p><a class="sf-button" href="{{ route('storefront.products.index') }}">Ver todas las piezas</a></div>
        @endforelse
    </div>
    @if ($products->hasPages())<div class="sf-pagination">{{ $products->links() }}</div>@endif
</section>
@endsection
