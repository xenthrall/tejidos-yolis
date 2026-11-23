<x-filament-panels::page>
    <div class="cat-workspace">
        <header class="cat-page-header">
            <div><span class="cat-eyebrow">Tejidos Yolis / Catálogo</span><h1>Tus categorías</h1><p>Organiza tus creaciones para que encontrar una pieza sea más fácil.</p></div>
            <div class="cat-header-actions"><a class="cat-button cat-button-secondary" href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('index') }}">Ver productos</a><a class="cat-button" href="{{ \Tequia\Catalog\Filament\Resources\Categories\CategoryResource::getUrl('create') }}"><x-filament::icon icon="heroicon-o-plus" />Nueva categoría</a></div>
        </header>
        <div class="cat-overview cat-category-overview" aria-label="Resumen de categorías">
            <button type="button" wire:click="$set('visibility', '')" @class(['cat-overview-item', 'is-selected' => $visibility === ''])><span>Todas las categorías</span><strong>{{ $total }}</strong><small>Tu organización completa</small></button>
            <button type="button" wire:click="$set('visibility', 'visible')" @class(['cat-overview-item', 'is-selected' => $visibility === 'visible'])><span>Visibles</span><strong>{{ $visible }}</strong><small>Disponibles en el catálogo</small></button>
            <button type="button" wire:click="$set('visibility', 'hidden')" @class(['cat-overview-item', 'is-selected' => $visibility === 'hidden'])><span>Ocultas</span><strong>{{ $hidden }}</strong><small>Conservadas en tu gestión</small></button>
        </div>
        <section class="cat-list-panel" aria-label="Categorías del catálogo">
            <div class="cat-toolbar">
                <div class="cat-search"><x-filament::icon icon="heroicon-o-magnifying-glass" /><label class="sr-only" for="category-search">Buscar categorías</label><input id="category-search" type="search" wire:model.live.debounce.350ms="search" maxlength="100" placeholder="Busca una categoría…"></div>
                <div class="cat-view-switch" role="group" aria-label="Modo de visualización"><button type="button" wire:click="setViewMode('grid')" aria-pressed="{{ $viewMode === 'grid' ? 'true' : 'false' }}" title="Cuadrícula"><x-filament::icon icon="heroicon-o-squares-2x2" /><span>Cuadrícula</span></button><button type="button" wire:click="setViewMode('list')" aria-pressed="{{ $viewMode === 'list' ? 'true' : 'false' }}" title="Lista"><x-filament::icon icon="heroicon-o-bars-3" /><span>Lista</span></button></div>
            </div>
            <div class="cat-filter-row cat-category-filters"><div class="cat-field"><label for="category-visibility">Visibilidad</label><select id="category-visibility" wire:model.live="visibility"><option value="">Todas las categorías</option><option value="visible">Visibles</option><option value="hidden">Ocultas</option></select></div><div class="cat-field"><label for="category-sort">Ordenar por</label><select id="category-sort" wire:model.live="sort"><option value="position">Posición en el catálogo</option><option value="name">Nombre A–Z</option><option value="products">Más productos</option><option value="recent">Más recientes</option></select></div></div>
            <div class="cat-list-summary"><span>{{ $categories->total() }} {{ $categories->total() === 1 ? 'categoría' : 'categorías' }}<span class="cat-muted" wire:loading wire:target="search,visibility,sort"> · Actualizando…</span></span>@if ($search || $visibility || $sort !== 'position')<button type="button" class="cat-text-button" wire:click="clearFilters">Limpiar filtros</button>@endif</div>
            @if ($categories->isEmpty())
                <div class="cat-empty"><span class="cat-empty-icon"><x-filament::icon icon="heroicon-o-tag" /></span><h2>{{ $total ? 'No encontramos categorías con esos filtros' : 'Dale un lugar a cada creación' }}</h2><p>{{ $total ? 'Prueba otro nombre o muestra todas tus categorías.' : 'Crea categorías como ruanas, bolsos o accesorios. Puedes empezar solo con el nombre.' }}</p>@if ($total)<button type="button" class="cat-button cat-button-secondary" wire:click="clearFilters">Mostrar todas</button>@else<a class="cat-button" href="{{ \Tequia\Catalog\Filament\Resources\Categories\CategoryResource::getUrl('create') }}">Crear mi primera categoría</a>@endif</div>
            @else
                <div class="cat-categories" data-view="{{ $viewMode === 'list' ? 'list' : 'grid' }}">
                    @foreach ($categories as $category)
                        <article class="cat-category-card" wire:key="category-{{ $category->id }}">
                            <div class="cat-category-heading"><span class="cat-category-symbol" aria-hidden="true">{{ mb_strtoupper(mb_substr($category->name, 0, 1)) }}</span><span class="cat-status" data-status="{{ $category->is_active ? 'published' : 'draft' }}"><x-filament::icon :icon="$category->is_active ? 'heroicon-o-eye' : 'heroicon-o-eye-slash'" />{{ $category->is_active ? 'Visible' : 'Oculta' }}</span></div>
                            <div class="cat-category-content"><h2><a href="{{ \Tequia\Catalog\Filament\Resources\Categories\CategoryResource::getUrl('edit', ['record' => $category]) }}">{{ $category->name }}</a></h2><p @class(['cat-category-description', 'cat-category-no-description' => ! $category->description])>{{ $category->description ?: 'Añade una descripción para presentar esta colección.' }}</p></div>
                            <div class="cat-category-numbers"><a href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('index', ['category' => $category->id]) }}"><strong>{{ $category->products_count }}</strong><span>{{ $category->products_count === 1 ? 'producto' : 'productos' }}</span></a><div><span>{{ $category->published_products_count }} {{ $category->published_products_count === 1 ? 'publicado' : 'publicados' }}</span><small>Posición {{ $category->sort_order }}</small></div></div>
                            <div class="cat-category-actions"><a class="cat-edit-link" href="{{ \Tequia\Catalog\Filament\Resources\Categories\CategoryResource::getUrl('edit', ['record' => $category]) }}"><x-filament::icon icon="heroicon-o-pencil-square" />Editar</a><div class="cat-product-more">@if ($category->is_active)<a class="cat-icon-button" href="{{ route('storefront.products.index', ['categoria' => $category->slug]) }}" target="_blank" rel="noopener" title="Ver categoría en el catálogo" aria-label="Ver {{ $category->name }} en el catálogo"><x-filament::icon icon="heroicon-o-arrow-top-right-on-square" /></a>@endif{{ ($this->toggleVisibilityAction)(['category' => $category->id, 'active' => $category->is_active])->iconButton() }}</div></div>
                        </article>
                    @endforeach
                </div>
                <div class="cat-pagination">{{ $categories->links() }}</div>
            @endif
        </section>
        <p class="cat-help cat-category-footnote"><x-filament::icon icon="heroicon-o-information-circle" />Ocultar una categoría también oculta sus productos en la tienda. No se elimina ningún producto.</p>
    </div>
</x-filament-panels::page>
