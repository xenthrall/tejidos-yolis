@props([
    'asideHeading' => null,
    'asideDescription' => null,
])

@php
    use Filament\Support\Facades\FilamentView;
    use Filament\View\PanelsRenderHook;

    $livewire ??= null;
    $renderHookScopes = $livewire?->getRenderHookScopes();

    $highlights = [
        ['title' => 'Piezas con identidad', 'description' => 'Dale a cada producto el espacio y los detalles que merece.'],
        ['title' => 'Un catálogo que inspira', 'description' => 'Organiza tus colecciones y muestra cada textura con fotografías.'],
        ['title' => 'Tu taller, donde estés', 'description' => 'Gestiona tus creaciones desde el celular o el computador.'],
    ];
@endphp

<x-filament-panels::layout.base :livewire="$livewire">
    <div class="cdt-auth grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {{ FilamentView::renderHook(PanelsRenderHook::SIMPLE_LAYOUT_START, scopes: $renderHookScopes) }}

        <!-- Brand panel -->
        <aside class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#161412] p-12 text-stone-100">
            <div class="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl"></div>
            <div class="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
            <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-size-[22px_22px]"></div>

            <a href="{{ url('/') }}" class="relative flex items-center gap-3">
                <img src="{{ asset('brand/logo.svg') }}" alt="" class="h-9 w-9">
                <span class="text-sm font-semibold tracking-tight">Tejidos Yolis</span>
            </a>

            <div class="relative flex max-w-md flex-col gap-8">
                <div class="flex flex-col gap-4">
                    <h2 class="text-4xl font-semibold leading-tight tracking-tight">{{ $asideHeading }}</h2>
                    <p class="text-base leading-relaxed text-stone-400">{{ $asideDescription }}</p>
                </div>

                <ul class="flex flex-col gap-4">
                    @foreach ($highlights as $highlight)
                        <li class="flex gap-3">
                            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>
                            </span>
                            <div>
                                <p class="text-sm font-medium text-stone-100">{{ $highlight['title'] }}</p>
                                <p class="text-sm text-stone-400">{{ $highlight['description'] }}</p>
                            </div>
                        </li>
                    @endforeach
                </ul>
            </div>

            <p class="relative max-w-md text-xs italic leading-relaxed text-stone-500">
                "En cada puntada, una historia. En cada pieza, el cariño de nuestras manos."
            </p>
        </aside>

        <!-- Form panel -->
        <div class="relative flex flex-col bg-[#faf8f5] dark:bg-[#0e0c0a]">
            <div class="flex items-center justify-between px-6 py-5 sm:px-10">
                <a href="{{ url('/') }}" class="flex items-center gap-2.5 lg:invisible">
                    <img src="{{ asset('brand/logo.svg') }}" alt="" class="h-8 w-8">
                    <span class="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">Tejidos Yolis</span>
                </a>

                <a href="{{ url('/') }}" class="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m6 6-6-6 6-6"/></svg>
                    Ver el catálogo
                </a>
            </div>

            <main id="fi-main-content" tabindex="-1" class="flex flex-1 items-center justify-center px-6 pb-10 sm:px-10">
                <div class="w-full max-w-sm">
                    {{ $slot }}
                </div>
            </main>

            <p class="px-6 pb-6 text-center text-xs text-stone-400 dark:text-stone-500 sm:px-10">
                Hecho con cariño. Gestionado a tu ritmo.
            </p>

            {{ FilamentView::renderHook(PanelsRenderHook::FOOTER, scopes: $renderHookScopes) }}
        </div>

        {{ FilamentView::renderHook(PanelsRenderHook::SIMPLE_LAYOUT_END, scopes: $renderHookScopes) }}
    </div>
</x-filament-panels::layout.base>
