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
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone', 50)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->uuid('course_id');
            $table->uuid('branch_id');
            $table->uuid('batch_id')->nullable();
            $table->date('admission_date');
            $table->decimal('total_fee', 10, 2);
            $table->decimal('admission_fee', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('final_fee', 10, 2);
            $table->enum('payment_status', ['pending', 'partial', 'completed'])->default('pending');
            $table->enum('status', ['active', 'inactive', 'completed', 'dropped'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('course_id');
            $table->index('branch_id');
            $table->index('batch_id');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
