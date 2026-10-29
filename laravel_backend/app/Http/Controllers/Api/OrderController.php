<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index()
    {
        $orders = Order::with('orderItems.medicine')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'required|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'sometimes|in:pending,confirmed,completed',
            'payment_status' => 'sometimes|in:pending,paid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            $orderItems = [];
            $status = $request->input('status', 'pending');

            // Validate stock and calculate totals
            foreach ($request->items as $item) {
                $medicine = Medicine::lockForUpdate()->find($item['medicine_id']);

                if (!$medicine) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Medicine not found'
                    ], 404);
                }

                // If creating a confirmed order (from staff POS), check stock immediately
                if ($status === 'confirmed' && $medicine->stock_quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for {$medicine->name}. Available: {$medicine->stock_quantity}, Requested: {$item['quantity']}"
                    ], 400);
                }

                $subtotal = $item['unit_price'] * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'medicine' => $medicine,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal
                ];
            }

            // Generate order number
            $lastOrder = Order::latest('id')->first();
            $orderNumber = 'ORD-' . str_pad(($lastOrder ? $lastOrder->id + 1 : 1), 6, '0', STR_PAD_LEFT);

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'total_amount' => $request->total_amount,
                'status' => $status,
                'payment_status' => $request->input('payment_status', 'pending')
            ]);

            // Create order items and deduct stock if confirmed
            foreach ($orderItems as $orderItemData) {
                $medicine = $orderItemData['medicine'];
                
                $order->orderItems()->create([
                    'medicine_id' => $medicine->id,
                    'quantity' => $orderItemData['quantity'],
                    'unit_price' => $orderItemData['unit_price'],
                    'subtotal' => $orderItemData['subtotal']
                ]);

                // Deduct stock if order is confirmed (staff POS orders)
                if ($status === 'confirmed') {
                    $quantityBefore = $medicine->stock_quantity;
                    $medicine->decrement('stock_quantity', $orderItemData['quantity']);
                    $medicine->refresh();

                    // Create stock movement record
                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'user_id' => auth()->id(),
                        'movement_type' => 'sale',
                        'quantity_change' => -$orderItemData['quantity'],
                        'quantity_before' => $quantityBefore,
                        'quantity_after' => $medicine->stock_quantity,
                        'reason' => 'Sale - Order ' . $orderNumber,
                        'notes' => "Customer: {$request->customer_name}"
                    ]);
                }
            }

            DB::commit();

            // Load relationships for response
            $order->load('orderItems.medicine');

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(string $id)
    {
        $order = Order::with('orderItems.medicine')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::with('orderItems.medicine')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled,rejected',
            'payment_status' => 'sometimes|in:pending,paid,refunded',
            'rejection_reason' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $oldStatus = $order->status;
            $newStatus = $request->input('status', $oldStatus);

            // If order is being confirmed from pending, deduct stock
            if ($newStatus === 'confirmed' && $oldStatus === 'pending') {
                foreach ($order->orderItems as $orderItem) {
                    $medicine = Medicine::lockForUpdate()->find($orderItem->medicine_id);
                    
                    if ($medicine->stock_quantity < $orderItem->quantity) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => "Insufficient stock for {$medicine->name}. Available: {$medicine->stock_quantity}, Required: {$orderItem->quantity}"
                        ], 400);
                    }

                    $quantityBefore = $medicine->stock_quantity;
                    $medicine->decrement('stock_quantity', $orderItem->quantity);
                    $medicine->refresh();

                    // Create stock movement record
                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'user_id' => auth()->id(),
                        'movement_type' => 'sale',
                        'quantity_change' => -$orderItem->quantity,
                        'quantity_before' => $quantityBefore,
                        'quantity_after' => $medicine->stock_quantity,
                        'reason' => 'Sale - Order ' . $order->order_number,
                        'notes' => "Customer: {$order->customer_name}"
                    ]);
                }
            }

            // If order is being cancelled/rejected after confirmation, restore stock
            if (in_array($newStatus, ['cancelled', 'rejected']) && $oldStatus === 'confirmed') {
                foreach ($order->orderItems as $orderItem) {
                    $medicine = Medicine::lockForUpdate()->find($orderItem->medicine_id);
                    
                    $quantityBefore = $medicine->stock_quantity;
                    $medicine->increment('stock_quantity', $orderItem->quantity);
                    $medicine->refresh();

                    // Create stock movement record for return
                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'user_id' => auth()->id(),
                        'movement_type' => 'returned',
                        'quantity_change' => $orderItem->quantity,
                        'quantity_before' => $quantityBefore,
                        'quantity_after' => $medicine->stock_quantity,
                        'reason' => 'Order ' . ucfirst($newStatus) . ' - ' . $order->order_number,
                        'notes' => $request->input('rejection_reason', 'Order ' . $newStatus)
                    ]);
                }
            }

            $order->update($request->only(['status', 'payment_status']));
            
            if ($request->has('rejection_reason')) {
                $order->update(['rejection_reason' => $request->rejection_reason]);
            }

            DB::commit();

            $order->load('orderItems.medicine');

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order.
     */
    public function destroy(string $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if (in_array($order->status, ['confirmed', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete confirmed or completed order'
            ], 400);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
}

