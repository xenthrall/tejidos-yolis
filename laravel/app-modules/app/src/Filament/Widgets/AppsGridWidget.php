<?php

namespace Tequia\App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Route;

/**
 * Accesos a las secciones disponibles del panel.
 */
class AppsGridWidget extends Widget
{
    protected string $view = 'app::filament.widgets.apps-grid-widget';

    protected int|string|array $columnSpan = 'full';

    /**
     * Después de `WelcomeWidget` (sort -1 por defecto), para que el saludo
     * quede primero y el lanzador de módulos justo debajo.
     */
    protected static ?int $sort = 1;

    /**
     * @return array<int, array{label: string, description: string, icon: string, url: string, accent: string, shortcuts: array<int, array{label: string, icon: string, url: string}>}>
     */
    public function getApps(): array
    {
        if (! auth()->user()?->is_admin || ! Route::has('filament.app.resources.productos.index')) {
            return [];
        }

        return [
            [
                'label' => 'Catálogo',
                'description' => 'Productos, categorías, fotografías, variantes y existencias.',
                'icon' => 'heroicon-o-shopping-bag',
                'url' => route('filament.app.resources.productos.index'),
                'accent' => 'emerald',
                'shortcuts' => [
                    ['label' => 'Productos', 'icon' => 'heroicon-o-shopping-bag', 'url' => route('filament.app.resources.productos.index')],
                    ['label' => 'Categorías', 'icon' => 'heroicon-o-tag', 'url' => route('filament.app.resources.categorias.index')],
                ],
            ],
        ];
    }
}
