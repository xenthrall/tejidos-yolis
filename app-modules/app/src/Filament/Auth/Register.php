<?php

namespace Tequia\App\Filament\Auth;

use Filament\Auth\Pages\Register as BaseRegister;

/**
 * Registro con el mismo layout de marca que el login.
 */
class Register extends BaseRegister
{
    protected static string $layout = 'app::filament.auth.layout';

    public function hasLogo(): bool
    {
        return false;
    }

    /**
     * @return array<string, mixed>
     */
    protected function getLayoutData(): array
    {
        return [
            ...parent::getLayoutData(),
            'asideHeading' => 'Lo hecho a mano nos conecta.',
            'asideDescription' => 'Descubre el universo de Tejidos Yolis: piezas con identidad, texturas que abrigan e historias tejidas con cariño.',
        ];
    }
}
