<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\SnippetController;
use App\Http\Controllers\SystemDocumentController;
use App\Http\Controllers\TagController;
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

    Route::resource('tags', TagController::class)->only(['index', 'store', 'destroy']);
    Route::resource('documents', DocumentController::class);
    Route::resource('skills', SkillController::class);
    Route::resource('snippets', SnippetController::class);
    Route::resource('assets', AssetController::class);
    Route::get('assets/{asset}/download', [AssetController::class, 'download'])->name('assets.download');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
