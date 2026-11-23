<x-filament-panels::page>
    <div class="cat-workspace">
        <header class="cat-page-header">
            <div><span class="cat-eyebrow">Tejidos Yolis / Catálogo</span><h1>Tus productos</h1><p>Cada creación tiene su lugar. Organiza, prepara y publica las tuyas.</p></div>
            <div class="cat-header-actions"><a class="cat-button cat-button-secondary" href="{{ route('storefront.products.index') }}" target="_blank" rel="noopener">Ver catálogo</a><a class="cat-button" href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('create') }}"><x-filament::icon icon="heroicon-o-plus" />Nuevo producto</a></div>
        </header>
        <div class="cat-overview" aria-label="Resumen del catálogo">
            <button type="button" wire:click="$set('status', '')" @class(['cat-overview-item', 'is-selected' => $status === ''])><span>Todos los productos</span><strong>{{ $total }}</strong><small>Tu colección completa</small></button>
            <button type="button" wire:click="$set('status', 'published')" @class(['cat-overview-item', 'is-selected' => $status === 'published'])><span>Publicados</span><strong>{{ $counts['published'] ?? 0 }}</strong><small>Listos para mostrar</small></button>
            <button type="button" wire:click="$set('status', 'draft')" @class(['cat-overview-item', 'is-selected' => $status === 'draft'])><span>En preparación</span><strong>{{ $counts['draft'] ?? 0 }}</strong><small>Guardados como borrador</small></button>
            <button type="button" wire:click="$set('status', 'archived')" @class(['cat-overview-item', 'is-selected' => $status === 'archived'])><span>Archivados</span><strong>{{ $counts['archived'] ?? 0 }}</strong><small>Conservados para después</small></button>
        </div>
        <section class="cat-list-panel" aria-label="Productos del catálogo">
            <div class="cat-toolbar">
                <div class="cat-search"><x-filament::icon icon="heroicon-o-magnifying-glass" /><label class="sr-only" for="catalog-search">Buscar por nombre o referencia</label><input id="catalog-search" type="search" wire:model.live.debounce.350ms="search" placeholder="Busca por nombre o referencia…" maxlength="100"></div>
                <div class="cat-view-switch" role="group" aria-label="Modo de visualización"><button type="button" wire:click="setViewMode('grid')" aria-pressed="{{ $viewMode === 'grid' ? 'true' : 'false' }}" title="Cuadrícula"><x-filament::icon icon="heroicon-o-squares-2x2" /><span>Cuadrícula</span></button><button type="button" wire:click="setViewMode('list')" aria-pressed="{{ $viewMode === 'list' ? 'true' : 'false' }}" title="Lista"><x-filament::icon icon="heroicon-o-bars-3" /><span>Lista</span></button></div>
            </div>
            <div class="cat-filter-row">
                <div class="cat-field"><label for="category-filter">Categoría</label><select id="category-filter" wire:model.live="category"><option value="">Todas las categorías</option>@foreach ($categories as $item)<option value="{{ $item->id }}">{{ $item->name }}</option>@endforeach</select></div>
                <div class="cat-field"><label for="status-filter">Publicación</label><select id="status-filter" wire:model.live="status"><option value="">Todos los estados</option><option value="published">Publicados</option><option value="draft">Borradores</option><option value="archived">Archivados</option></select></div>
                <div class="cat-field"><label for="stock-filter">Disponibilidad</label><select id="stock-filter" wire:model.live="availability"><option value="">Cualquier disponibilidad</option><option value="available">Disponibles</option><option value="sold">Vendidos o agotados</option></select></div>
                <div class="cat-field"><label for="sort-filter">Ordenar</label><select id="sort-filter" wire:model.live="sort"><option value="recent">Más recientes</option><option value="updated">Últimos cambios</option><option value="name">Nombre A–Z</option></select></div>
            </div>
            <div class="cat-list-summary"><span>{{ $products->total() }} {{ $products->total() === 1 ? 'producto' : 'productos' }}<span wire:loading wire:target="search,status,category,availability,sort" class="cat-muted"> · Actualizando…</span></span>@if ($search || $status || $category || $availability || $sort !== 'recent')<button type="button" class="cat-text-button" wire:click="clearFilters">Limpiar filtros</button>@endif</div>
            @if ($products->isEmpty())
                <div class="cat-empty"><span class="cat-empty-icon"><x-filament::icon icon="heroicon-o-shopping-bag" /></span><h2>{{ $total ? 'No encontramos productos con esos filtros' : 'Tu próxima creación empieza aquí' }}</h2><p>{{ $total ? 'Cambia la búsqueda o limpia los filtros para ver tu colección.' : 'Añade un nombre, su precio y algunas fotos. Los demás detalles pueden esperar.' }}</p>@if ($total)<button class="cat-button cat-button-secondary" type="button" wire:click="clearFilters">Mostrar todos</button>@else<a class="cat-button" href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('create') }}">Crear mi primer producto</a>@endif</div>
            @else
                <div class="cat-products" data-view="{{ $viewMode === 'list' ? 'list' : 'grid' }}">
                    @foreach ($products as $product)
                        <article class="cat-product" wire:key="product-{{ $product->id }}">
                            <a class="cat-product-cover" href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('edit', ['record' => $product]) }}" aria-label="Editar {{ $product->name }}">@if ($product->cover())<img src="{{ $product->cover()->url(true) }}" alt="{{ $product->name }}" width="640" height="640" loading="lazy">@else<div class="cat-cover-placeholder"><x-filament::icon icon="heroicon-o-photo" /><span>Sin fotografías</span></div>@endif<span class="cat-image-count"><x-filament::icon icon="heroicon-o-photo" />{{ $product->images->count() }}</span></a>
                            <div class="cat-product-body"><div class="cat-product-top"><span class="cat-product-category">{{ $product->category?->name ?? 'Sin categoría' }}</span><span class="cat-status" data-status="{{ $product->status->value }}">{{ $product->status->getLabel() }}</span></div><h2><a href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('edit', ['record' => $product]) }}">{{ $product->name }}</a></h2><p class="cat-product-price">{{ $product->priceLabel() }}</p><div class="cat-product-details"><span @class(['cat-stock', 'is-available' => $product->isAvailable()])>{{ $product->availabilityLabel() }}</span><span>{{ $product->is_unique ? 'Pieza única' : ($product->has_variants ? $product->variants->count().' variantes' : $product->activeVariants()->sum('stock').' unidades') }}</span></div></div>
                            <div class="cat-product-actions"><a class="cat-edit-link" href="{{ \Tequia\Catalog\Filament\Resources\Products\ProductResource::getUrl('edit', ['record' => $product]) }}"><x-filament::icon icon="heroicon-o-pencil-square" />Editar</a><div class="cat-product-more">@if ($product->status === \Tequia\Catalog\Enums\ProductStatus::Published)<a class="cat-icon-button" href="{{ route('storefront.products.show', $product->slug) }}" target="_blank" rel="noopener" aria-label="Ver {{ $product->name }} en el catálogo" title="Ver en el catálogo"><x-filament::icon icon="heroicon-o-eye" /></a>@endif{{ ($this->archiveProductAction)(['product' => $product->id, 'archived' => $product->status === \Tequia\Catalog\Enums\ProductStatus::Archived])->iconButton() }}</div></div>
                        </article>
                    @endforeach
                </div>
                <div class="cat-pagination">{{ $products->links() }}</div>
            @endif
        </section>
    </div>
</x-filament-panels::page>
