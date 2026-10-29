<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'medicine_code',
        'barcode',
        'name',
        'description',
        'category',
        'price',
        'stock_quantity',
        'expiry_date'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'expiry_date' => 'date'
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
