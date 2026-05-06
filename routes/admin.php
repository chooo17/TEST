<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LaporanController;

Route::middleware(['auth', 'role:admin|superadmin'])->group(function () {
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan');
    Route::get('/laporan/harian', [LaporanController::class, 'harian'])->name('laporan.harian');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', fn () => Inertia::render('Admin/AdminDashboard'));
});

