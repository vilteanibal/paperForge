<?php

declare(strict_types=1);

use App\Http\Controllers\BibliographyController;
use App\Http\Controllers\CompilerController;
use App\Http\Controllers\FileSystemController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SyncTeXController;
use Illuminate\Support\Facades\Route;

Route::middleware(['throttle:local_api'])->group(function () {
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{project}/bibliography', [BibliographyController::class, 'index'])->name('projects.bibliography');

    Route::prefix('fs/{project}')->name('fs.')->group(function () {
        Route::get('tree', [FileSystemController::class, 'tree'])->name('tree');
        Route::post('read', [FileSystemController::class, 'read'])->name('read');
        Route::post('write', [FileSystemController::class, 'write'])->name('write');
        Route::post('delete', [FileSystemController::class, 'delete'])->name('delete');
    });

    Route::prefix('synctex/{project}')->name('synctex.')->group(function () {
        Route::post('forward', [SyncTeXController::class, 'forward'])->name('forward');
        Route::post('reverse', [SyncTeXController::class, 'reverse'])->name('reverse');
    });
});

Route::prefix('compile/{project}')->name('compile.')->group(function () {
    Route::post('/', [CompilerController::class, 'compile'])
        ->middleware('throttle:compiler_api')
        ->name('run');
    Route::get('pdf', [CompilerController::class, 'downloadPdf'])
        ->name('pdf');
});
