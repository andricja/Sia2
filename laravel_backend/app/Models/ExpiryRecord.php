<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpiryRecord extends Model
{
    protected $fillable = [
        'medicine_id',
        'quantity',
        'expiry_date',
        'added_date'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'added_date' => 'date',
    ];

    /**
     * Get the medicine for this expiry record
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }
}
