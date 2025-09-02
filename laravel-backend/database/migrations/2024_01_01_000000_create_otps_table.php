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
        Schema::create('otps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone', 20);
            $table->string('otp', 6);
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->integer('attempts')->default(0);
            $table->timestamps();
            
            $table->index('phone');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otps');
    }
};

