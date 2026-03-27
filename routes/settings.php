<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\WorkspaceSettingsController;
use App\Http\Controllers\WorkspaceTokenController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::middleware('workspace')->group(function () {
        Route::get('settings/workspace', [WorkspaceSettingsController::class, 'edit'])->name('workspace.settings');
        Route::put('settings/workspace', [WorkspaceSettingsController::class, 'update'])->name('workspace.settings.update');

        Route::post('settings/workspace/tokens', [WorkspaceTokenController::class, 'store'])->name('workspace.tokens.store');
        Route::delete('settings/workspace/tokens/{token}', [WorkspaceTokenController::class, 'destroy'])->name('workspace.tokens.destroy');
    });
});
