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
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // CMU, DMU, ARDMS
            $table->text('description')->nullable();
            $table->integer('duration'); // in months
            $table->decimal('total_fee', 10, 2);
            $table->decimal('admission_fee', 10, 2);
            $table->integer('installment_count')->default(1);
            $table->integer('batch_size_limit')->default(30);
            $table->uuid('branch_id')->nullable();
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('branch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
