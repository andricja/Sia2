<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StockMovementController extends Controller
{
    /**
     * Get all stock movements
     */
    public function index(Request $request)
    {
        $query = StockMovement::with(['medicine', 'user'])
            ->orderBy('created_at', 'desc');

        // Filter by medicine
        if ($request->has('medicine_id')) {
            $query->where('medicine_id', $request->medicine_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $movements = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $movements
        ]);
    }

    /**
     * Create stock adjustment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'medicine_id' => 'required|exists:medicines,id',
            'movement_type' => 'required|in:received,adjustment,damaged,expired,sold,returned',
            'quantity_change' => 'required|integer',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Lock the medicine row
            $medicine = Medicine::lockForUpdate()->find($request->medicine_id);

            if (!$medicine) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Medicine not found'
                ], 404);
            }

            $quantityBefore = $medicine->stock_quantity;
            $quantityAfter = $quantityBefore + $request->quantity_change;

            // Prevent negative stock
            if ($quantityAfter < 0) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Adjustment would result in negative stock. Current stock: ' . $quantityBefore
                ], 400);
            }

            // Update medicine stock
            $medicine->stock_quantity = $quantityAfter;
            $medicine->save();

            // Create stock movement record
            $movement = StockMovement::create([
                'medicine_id' => $medicine->id,
                'user_id' => $request->user()->id,
                'movement_type' => $request->movement_type,
                'quantity_change' => $request->quantity_change,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reason' => $request->reason,
                'notes' => $request->notes
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock adjusted successfully',
                'data' => $movement->load(['medicine', 'user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to adjust stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stock movements for a specific medicine
     */
    public function getMedicineHistory($medicineId)
    {
        $medicine = Medicine::find($medicineId);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }

        $movements = StockMovement::with('user')
            ->where('medicine_id', $medicineId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'medicine' => $medicine,
                'movements' => $movements
            ]
        ]);
    }
}
