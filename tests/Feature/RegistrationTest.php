<?php

afterEach(function () {
    unset($_SERVER['APP_INSTANCE'], $_ENV['APP_INSTANCE']);
});

test('self-hosted instances keep registration closed by default', function () {
    $this->get('/app/register')->assertNotFound();
});

test('hosted instances allow registration for Tejidos Yolis', function () {
    bootInstance('hosted');

    $this->get('/app/register')
        ->assertOk()
        ->assertSee('Tejidos Yolis')
        ->assertDontSee('cafe.tequia.dev');
});
