<?php

use App\Http\Controllers\Dev\StyleguideController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InfoPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

// Institutional pages of the footer (Chi siamo, FAQ…). Unknown slugs are the Italian 404.
Route::get('/{slug}', InfoPageController::class)->where('slug', '[a-z0-9-]+')->name('info');

// Reference page to compare the base styles with docs/DESIGN-SPEC.md. Never registered outside local.
if (app()->environment('local')) {
    Route::get('/_styleguide', StyleguideController::class)->name('styleguide');
}
