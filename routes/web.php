<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetFolderController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\CollectionDocumentController;
use App\Http\Controllers\CollectionItemController;
use App\Http\Controllers\CollectionMemoryEntryController;
use App\Http\Controllers\CollectionTokenController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\MemoryEntryController;
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
        ->where('type', '[a-z][a-z0-9_-]*')
        ->name('workspace.show');

    Route::put('workspace/{type}', [SystemDocumentController::class, 'update'])
        ->where('type', '[a-z][a-z0-9_-]*')
        ->name('workspace.update');

    Route::post('workspace', [SystemDocumentController::class, 'store'])
        ->name('workspace.store');

    Route::delete('workspace/{type}', [SystemDocumentController::class, 'destroy'])
        ->where('type', '[a-z][a-z0-9_-]*')
        ->name('workspace.destroy');

    Route::resource('tags', TagController::class)->only(['index', 'store', 'destroy']);
    Route::resource('documents', DocumentController::class);
    Route::get('skills/marketplace', [SkillMarketplaceController::class, 'index'])->name('skills.marketplace');
    Route::post('skills/marketplace/install', [SkillMarketplaceController::class, 'install'])->name('skills.marketplace.install');
    Route::resource('skills', SkillController::class);
    Route::resource('snippets', SnippetController::class);
    Route::post('assets/move', [AssetController::class, 'move'])->name('assets.move');
    Route::post('assets/copy', [AssetController::class, 'copy'])->name('assets.copy');
    Route::post('assets/batch-delete', [AssetController::class, 'batchDelete'])->name('assets.batch-delete');
    Route::resource('assets', AssetController::class);
    Route::get('assets/{asset}/download', [AssetController::class, 'download'])->name('assets.download');
    Route::resource('asset-folders', AssetFolderController::class)->except(['show', 'edit', 'create']);

    // Workspace memory entries
    Route::post('memory/batch-archive', [MemoryEntryController::class, 'batchArchive'])->name('memory.batch-archive');
    Route::get('memory', [MemoryEntryController::class, 'index'])->name('memory.index');
    Route::post('memory', [MemoryEntryController::class, 'store'])->name('memory.store');
    Route::put('memory/{entry}', [MemoryEntryController::class, 'update'])->name('memory.update');
    Route::post('memory/{entry}/pin', [MemoryEntryController::class, 'togglePin'])->name('memory.pin');
    Route::post('memory/{entry}/archive', [MemoryEntryController::class, 'archive'])->name('memory.archive');
    Route::post('memory/{entry}/unarchive', [MemoryEntryController::class, 'unarchive'])->name('memory.unarchive');
    Route::delete('memory/{entry}', [MemoryEntryController::class, 'destroy'])->name('memory.destroy');

    Route::get('search', SearchController::class)->name('search');

    Route::resource('collections', CollectionController::class);
    Route::post('collections/{collection}/items', [CollectionItemController::class, 'store'])->name('collections.items.store');
    Route::delete('collections/{collection}/items', [CollectionItemController::class, 'destroy'])->name('collections.items.destroy');
    // Collection documents
    Route::post('collections/{collection}/docs/reorder', [CollectionDocumentController::class, 'reorder'])->name('collections.docs.reorder');
    Route::post('collections/{collection}/docs', [CollectionDocumentController::class, 'store'])->name('collections.docs.store');
    Route::put('collections/{collection}/docs/{document}', [CollectionDocumentController::class, 'update'])->name('collections.docs.update');
    Route::delete('collections/{collection}/docs/{document}', [CollectionDocumentController::class, 'destroy'])->name('collections.docs.destroy');
    Route::post('collections/{collection}/tokens', [CollectionTokenController::class, 'store'])->name('collections.tokens.store');
    Route::delete('collections/{collection}/tokens/{token}', [CollectionTokenController::class, 'destroy'])->name('collections.tokens.destroy');

    // Collection memory entries
    Route::post('collections/{collection}/memory/batch-archive', [CollectionMemoryEntryController::class, 'batchArchive'])->name('collections.memory.batch-archive');
    Route::get('collections/{collection}/memory', [CollectionMemoryEntryController::class, 'index'])->name('collections.memory.index');
    Route::post('collections/{collection}/memory', [CollectionMemoryEntryController::class, 'store'])->name('collections.memory.store');
    Route::put('collections/{collection}/memory/{entry}', [CollectionMemoryEntryController::class, 'update'])->name('collections.memory.update');
    Route::post('collections/{collection}/memory/{entry}/pin', [CollectionMemoryEntryController::class, 'togglePin'])->name('collections.memory.pin');
    Route::post('collections/{collection}/memory/{entry}/archive', [CollectionMemoryEntryController::class, 'archive'])->name('collections.memory.archive');
    Route::post('collections/{collection}/memory/{entry}/unarchive', [CollectionMemoryEntryController::class, 'unarchive'])->name('collections.memory.unarchive');
    Route::delete('collections/{collection}/memory/{entry}', [CollectionMemoryEntryController::class, 'destroy'])->name('collections.memory.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
