<?php

namespace Tequia\App\Filament\Widgets;

use Filament\Widgets\Widget;

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
        return [];
    }
}
