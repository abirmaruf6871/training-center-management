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
        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('address');
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->uuid('manager_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
