<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SystemDocumentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'workspace'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('workspace/{type}', [SystemDocumentController::class, 'show'])
        ->where('type', 'identity|instructions|context|memory')
        ->name('workspace.show');

    Route::put('workspace/{type}', [SystemDocumentController::class, 'update'])
        ->where('type', 'identity|instructions|context|memory')
        ->name('workspace.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
