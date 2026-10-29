<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpiryRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpiryRecordController extends Controller
{
    /**
     * Get all expiry records
     */
    public function index()
    {
        $records = ExpiryRecord::with('medicine')
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Create a new expiry record
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'expiry_date' => 'required|date|after:today',
            'added_date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $record = ExpiryRecord::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Expiry record created successfully',
            'data' => $record->load('medicine')
        ], 201);
    }

    /**
     * Get expiry records for a specific medicine
     */
    public function getMedicineExpiry($medicineId)
    {
        $records = ExpiryRecord::where('medicine_id', $medicineId)
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Delete an expiry record
     */
    public function destroy($id)
    {
        $record = ExpiryRecord::find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Expiry record not found'
            ], 404);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expiry record deleted successfully'
        ]);
    }
}
