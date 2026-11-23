<?php

use App\Models\User;
use Filament\Facades\Filament;
use Livewire\Livewire;
use Tequia\App\Filament\Pages\Dashboard;
use Tequia\App\Filament\Widgets\WelcomeWidget;

beforeEach(function () {
    Filament::setCurrentPanel('app');
    $this->actingAs(User::factory()->create(['name' => 'Ana María López']));
});

it('greets the user by first name', function () {
    Livewire::test(WelcomeWidget::class)
        ->assertSeeText('Ana')
        ->assertDontSeeText('María');
});

it('renders the dashboard without links to disabled modules', function () {
    Livewire::withoutLazyLoading();

    $this->get(Dashboard::getUrl())
        ->assertSuccessful()
        ->assertDontSee('Bóveda')
        ->assertDontSee('Finanzas')
        ->assertDontSee('/app/vault-dashboard')
        ->assertDontSee('/app/finance-dashboard');
});

it('no longer shows the AI assistant preview', function () {
    $this->get(Dashboard::getUrl())
        ->assertSuccessful()
        ->assertDontSee('Café IA');
});
