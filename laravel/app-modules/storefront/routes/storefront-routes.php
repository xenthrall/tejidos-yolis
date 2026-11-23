<?php

use Illuminate\Support\Facades\Route;
use Tequia\Storefront\Http\Controllers\CatalogController;

Route::middleware('web')->group(function (): void {
    Route::get('/', [CatalogController::class, 'home'])->name('home');
    Route::get('/productos', [CatalogController::class, 'index'])->name('storefront.products.index');
    Route::get('/productos/{slug}', [CatalogController::class, 'show'])->name('storefront.products.show');
    Route::view('/nosotros', 'storefront::about')->name('storefront.about');
    Route::view('/contacto', 'storefront::contact')->name('storefront.contact');
});
