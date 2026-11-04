<?php

use App\Http\Controllers\Dev\StyleguideController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

// Reference page to compare the base styles with docs/DESIGN-SPEC.md. Never registered outside local.
if (app()->environment('local')) {
    Route::get('/_styleguide', StyleguideController::class)->name('styleguide');
}
