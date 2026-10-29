<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines.
     */
    public function index(Request $request)
    {
        $query = Medicine::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('medicine_code', 'LIKE', "%{$search}%")
                  ->orWhere('category', 'LIKE', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by availability
        if ($request->has('in_stock') && $request->in_stock == 'true') {
            $query->where('stock_quantity', '>', 0);
        }

        $medicines = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'medicine_code' => 'required|unique:medicines',
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string|unique:medicines',
            'expiry_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine = Medicine::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Medicine created successfully',
            'data' => $medicine
        ], 201);
    }

    /**
     * Display the specified medicine.
     */
    public function show(string $id)
    {
        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $medicine
        ]);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, string $id)
    {
        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'medicine_code' => 'sometimes|unique:medicines,medicine_code,' . $id,
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string|unique:medicines,barcode,' . $id,
            'expiry_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Medicine updated successfully',
            'data' => $medicine
        ]);
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy(string $id)
    {
        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }

        $medicine->delete();

        return response()->json([
            'success' => true,
            'message' => 'Medicine deleted successfully'
        ]);
    }
}

