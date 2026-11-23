@extends('storefront::layout')
@section('title', 'Nuestra historia · Tejidos Yolis')
@section('content')
<section class="sf-shell sf-editorial"><span class="sf-eyebrow">Nuestra historia</span><h1>Manos que crean.<br><em>Piezas que acompañan.</em></h1><div class="sf-editorial-body"><img class="sf-story-logo" src="{{ asset('brand/logo.svg') }}" alt="La oveja de Tejidos Yolis" width="220" height="180"><div><h2>Tejidos Yolis, desde Boyacá</h2><p>En El Espino, Boyacá, Yolis da forma a creaciones artesanales con dedicación y atención a los detalles.</p><p>Las ruanas son parte de esta historia. Cada pieza única tiene sus propios matices, texturas y carácter; el catálogo es una invitación a conocerlas de cerca.</p><p>Queremos que elijas con tranquilidad: mira las fotos, conoce los detalles y escríbenos si quieres saber más.</p><a class="sf-button" href="{{ route('storefront.products.index') }}">Conoce nuestras creaciones</a></div></div></section>
@endsection
