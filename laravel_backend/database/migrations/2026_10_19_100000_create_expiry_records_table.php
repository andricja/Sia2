<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop table if exists (in case of previous bad migration)
        Schema::dropIfExists('expiry_records');
        
        Schema::create('expiry_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medicine_id');
            $table->integer('quantity');
            $table->date('expiry_date');
            $table->date('added_date');
            $table->timestamps();
            
            $table->foreign('medicine_id')->references('id')->on('medicines')->onDelete('cascade');
            $table->index('medicine_id');
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expiry_records');
    }
};
