<div class="sf-gallery" data-gallery>
    <div class="sf-main-frame">
        <button class="sf-main-photo" type="button" data-zoom-open aria-haspopup="dialog" aria-controls="product-photo-viewer" aria-label="Ampliar fotografías de {{ $product->name }}" @disabled(! $product->cover())>
            @if ($product->cover())
                <img data-main-photo src="{{ $product->cover()->url() }}" alt="{{ $product->cover()->alt ?: $product->name }}" width="1000" height="1250" fetchpriority="high" draggable="false">
            @else
                <span class="sf-image-placeholder"><img src="{{ asset('brand/logo.svg') }}" alt="" width="100" height="80"><span>Fotografías próximamente</span></span>
            @endif
            <span class="sf-zoom-label">@include('storefront::partials.icon', ['icon' => 'expand'])<span>Ver en detalle</span></span>
        </button>
        <span class="sf-gallery-counter" data-main-counter>{{ $product->images->isNotEmpty() ? '1 / '.$product->images->count() : 'Sin fotografías' }}</span>
        <button class="sf-gallery-arrow sf-gallery-previous" type="button" data-gallery-previous aria-label="Fotografía anterior" @if ($product->images->count() < 2) hidden @endif>@include('storefront::partials.icon', ['icon' => 'previous'])</button>
        <button class="sf-gallery-arrow sf-gallery-next" type="button" data-gallery-next aria-label="Fotografía siguiente" @if ($product->images->count() < 2) hidden @endif>@include('storefront::partials.icon', ['icon' => 'next'])</button>
    </div>
    <div class="sf-thumbnails" data-thumbnails role="group" aria-label="Elegir fotografía">
        @foreach ($product->images as $image)
            <button type="button" data-image-index="{{ $loop->index }}" aria-label="Ver fotografía {{ $loop->iteration }} de {{ $product->images->count() }}" aria-pressed="{{ $loop->first ? 'true' : 'false' }}"><img src="{{ $image->url(true) }}" alt="" width="100" height="125" loading="lazy" draggable="false"></button>
        @endforeach
    </div>
    <p class="sf-gallery-help"><span class="sf-desktop-hint">Amplía las fotos para descubrir cada textura y detalle.</span><span class="sf-mobile-hint">Desliza para explorar · Toca la foto para ampliar</span></p>
    <p class="sr-only" role="status" aria-live="polite" data-gallery-announcement></p>
    <dialog class="sf-lightbox" id="product-photo-viewer" data-lightbox aria-labelledby="product-viewer-title" aria-describedby="product-viewer-instructions">
        <div class="sf-viewer">
            <header class="sf-viewer-header">
                <div class="sf-viewer-title"><span>Una mirada más de cerca</span><h2 id="product-viewer-title">{{ $product->name }}</h2></div>
                <div class="sf-viewer-tools" role="group" aria-label="Controles de fotografía">
                    <span class="sf-viewer-counter" data-viewer-counter></span>
                    <div class="sf-zoom-controls"><button type="button" data-zoom-out aria-label="Reducir zoom" title="Reducir zoom">@include('storefront::partials.icon', ['icon' => 'minus'])</button><button class="sf-zoom-percentage" type="button" data-zoom-reset aria-label="Restablecer zoom" title="Restablecer zoom">100%</button><button type="button" data-zoom-in aria-label="Aumentar zoom" title="Aumentar zoom">@include('storefront::partials.icon', ['icon' => 'plus'])</button></div>
                    <button class="sf-viewer-close" type="button" data-zoom-close aria-label="Cerrar galería" title="Cerrar galería" autofocus>@include('storefront::partials.icon', ['icon' => 'close'])</button>
                </div>
            </header>
            <div class="sf-viewer-canvas">
                <div class="sf-viewer-stage" data-zoom-stage>
                    <img data-zoom-photo alt="" draggable="false">
                </div>
                <div class="sf-viewer-loading" data-viewer-loading hidden role="status"><span class="sf-viewer-spinner" aria-hidden="true"></span><span>Cargando fotografía…</span></div>
                <div class="sf-viewer-error" data-viewer-error hidden role="status">@include('storefront::partials.icon', ['icon' => 'photo'])<p>No pudimos cargar esta fotografía.</p><button type="button" data-gallery-retry>Volver a intentar</button></div>
                <button class="sf-viewer-arrow sf-viewer-previous" type="button" data-viewer-previous aria-label="Fotografía anterior" title="Anterior">@include('storefront::partials.icon', ['icon' => 'previous'])</button>
                <button class="sf-viewer-arrow sf-viewer-next" type="button" data-viewer-next aria-label="Fotografía siguiente" title="Siguiente">@include('storefront::partials.icon', ['icon' => 'next'])</button>
            </div>
            <div class="sf-viewer-thumbnails" data-viewer-thumbnails role="group" aria-label="Fotografías del producto"></div>
            <p class="sf-viewer-instructions" id="product-viewer-instructions"><span class="sf-desktop-hint">Usa las flechas para explorar · Haz clic o usa la rueda para ampliar · Esc para cerrar</span><span class="sf-mobile-hint">Desliza para pasar · Pellizca o toca dos veces para ampliar</span></p>
        </div>
    </dialog>
</div>
