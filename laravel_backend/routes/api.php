<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExpiryRecordController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'MediKiosk API is running'
    ]);
});

// Public routes
// Medicine routes (public for customers)
Route::apiResource('medicines', MedicineController::class)->only(['index', 'show']);

// Category routes (public for customers)
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{id}', [CategoryController::class, 'show']);

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Admin/Staff medicine management
    Route::apiResource('medicines', MedicineController::class)->except(['index', 'show']);
    
    // Admin/Staff category management
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);
    
    // Admin/Staff order management
    Route::apiResource('orders', OrderController::class);
    
    // Stock movements (Staff)
    Route::get('/stock-movements', [StockMovementController::class, 'index']);
    Route::post('/stock-movements', [StockMovementController::class, 'store']);
    Route::get('/stock-movements/medicine/{medicineId}', [StockMovementController::class, 'getMedicineHistory']);
    
    // Expiry records
    Route::get('/expiry-records', [ExpiryRecordController::class, 'index']);
    Route::post('/expiry-records', [ExpiryRecordController::class, 'store']);
    Route::get('/expiry-records/medicine/{medicineId}', [ExpiryRecordController::class, 'getMedicineExpiry']);
    Route::delete('/expiry-records/{id}', [ExpiryRecordController::class, 'destroy']);
});
