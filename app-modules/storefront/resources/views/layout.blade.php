<!DOCTYPE html>
<html lang="es">
<head>
    @php
        $pageTitle = trim($__env->yieldContent('title', 'Tejidos Yolis · Piezas hechas a mano'));
        $pageDescription = trim($__env->yieldContent('description', 'Descubre ruanas y creaciones artesanales de Tejidos Yolis, desde El Espino, Boyacá. Conoce cada pieza y conversa directamente con su creadora.'));
        $pageImage = trim($__env->yieldContent('og-image', asset('brand/logo.svg')));
        $pageType = trim($__env->yieldContent('og-type', 'website'));
    @endphp
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#244c45">
    <title>{{ $pageTitle }}</title>
    <meta name="description" content="{{ $pageDescription }}">
    <link rel="canonical" href="{{ url()->current() }}">
    <link rel="icon" type="image/svg+xml" href="{{ asset('brand/logo.svg') }}">
    <meta property="og:type" content="{{ $pageType }}">
    <meta property="og:title" content="{{ $pageTitle }}">
    <meta property="og:description" content="{{ $pageDescription }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ $pageImage }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="storefront">
    <a class="sf-skip" href="#contenido">Saltar al contenido</a>
    <div class="sf-announcement">Desde El Espino, Boyacá · Hecho a mano, para acompañarte</div>
    <header class="sf-header">
        <div class="sf-shell sf-header-inner">
            <a class="sf-brand" href="{{ route('home') }}" aria-label="Tejidos Yolis, inicio">
                <img src="{{ asset('brand/logo.svg') }}" alt="" width="58" height="48">
                <span>Tejidos Yolis<small>Artesanía con historia</small></span>
            </a>
            <nav class="sf-nav" id="sf-site-nav" aria-label="Navegación principal">
                <a href="{{ route('storefront.products.index') }}" @class(['is-current' => request()->routeIs('storefront.products.*')])>Catálogo</a>
                <a href="{{ route('storefront.about') }}" @class(['is-current' => request()->routeIs('storefront.about')])>Nuestra historia</a>
                <a href="{{ route('storefront.contact') }}" @class(['is-current' => request()->routeIs('storefront.contact')])>Contacto</a>
            </nav>
            <div class="sf-header-tools">
                <a class="sf-header-contact" href="https://wa.me/{{ config('catalog.whatsapp') }}" target="_blank" rel="noopener noreferrer" aria-label="Hablar con Yolis por WhatsApp">@include('storefront::partials.icon', ['icon' => 'chat'])<span>Hablemos</span></a>
                <button class="sf-menu-toggle" type="button" data-menu-toggle aria-controls="sf-site-nav" aria-expanded="false" aria-label="Abrir menú" hidden><span data-menu-icon>@include('storefront::partials.icon', ['icon' => 'menu'])</span><span data-close-menu-icon hidden>@include('storefront::partials.icon', ['icon' => 'close'])</span></button>
            </div>
        </div>
    </header>
    <main id="contenido">@yield('content')</main>
    <footer class="sf-footer">
        <div class="sf-shell sf-footer-grid">
            <div><img class="sf-footer-logo" src="{{ asset('brand/logo.svg') }}" alt="" width="64" height="52"><a class="sf-footer-brand" href="{{ route('home') }}">Tejidos Yolis</a><p>El valor de una pieza está también<br>en las manos que la crean.</p></div>
            <div><h2>Explora</h2><a href="{{ route('storefront.products.index') }}">Todas las piezas</a><a href="{{ route('storefront.about') }}">Nuestra historia</a><a href="{{ route('storefront.contact') }}">Hablemos</a></div>
            <div><h2>Sigamos en contacto</h2><a href="https://wa.me/{{ config('catalog.whatsapp') }}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="{{ config('catalog.instagram') }}" target="_blank" rel="noopener noreferrer">Instagram</a><p>{{ config('catalog.location') }}</p></div>
        </div>
        <div class="sf-shell sf-footer-bottom"><span>© {{ now()->year }} Tejidos Yolis</span><a href="{{ url('/app') }}">Gestión del catálogo</a></div>
    </footer>
</body>
</html>
