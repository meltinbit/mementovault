<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\CollectionItemController;
use App\Http\Controllers\CollectionSystemDocumentController;
use App\Http\Controllers\CollectionTokenController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\SkillMarketplaceController;
use App\Http\Controllers\SnippetController;
use App\Http\Controllers\SystemDocumentController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('docs', function () {
    return Inertia::render('docs/index');
})->name('docs');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

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
    Route::get('skills/marketplace', [SkillMarketplaceController::class, 'index'])->name('skills.marketplace');
    Route::post('skills/marketplace/install', [SkillMarketplaceController::class, 'install'])->name('skills.marketplace.install');
    Route::resource('skills', SkillController::class);
    Route::resource('snippets', SnippetController::class);
    Route::resource('assets', AssetController::class);
    Route::get('assets/{asset}/download', [AssetController::class, 'download'])->name('assets.download');

    Route::get('search', SearchController::class)->name('search');

    Route::resource('collections', CollectionController::class);
    Route::post('collections/{collection}/items', [CollectionItemController::class, 'store'])->name('collections.items.store');
    Route::delete('collections/{collection}/items', [CollectionItemController::class, 'destroy'])->name('collections.items.destroy');
    Route::put('collections/{collection}/documents/{type}', [CollectionSystemDocumentController::class, 'update'])
        ->where('type', 'instructions|context|memory')
        ->name('collections.system-documents.update');
    Route::post('collections/{collection}/tokens', [CollectionTokenController::class, 'store'])->name('collections.tokens.store');
    Route::delete('collections/{collection}/tokens/{token}', [CollectionTokenController::class, 'destroy'])->name('collections.tokens.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
