<?php

use Illuminate\Database\Migrations\Migrator;

test('the public home belongs to Tejidos Yolis', function () {
    $this->get('/')
        ->assertOk()
        ->assertSee('Tejidos Yolis')
        ->assertDontSee('Café del Tiempo');
});

test('legacy public pages and reference modules are unavailable', function (string $path) {
    $this->get($path)->assertNotFound();
})->with([
    '/docs/instalacion',
    '/sitemap.xml',
    '/app/finance-dashboard',
    '/app/accounts',
    '/app/movements',
    '/app/financial-contexts',
    '/app/movement-templates',
    '/app/vault-dashboard',
]);

test('reference module migrations are not registered', function () {
    expect(app(Migrator::class)->paths())->toBeEmpty();
});
