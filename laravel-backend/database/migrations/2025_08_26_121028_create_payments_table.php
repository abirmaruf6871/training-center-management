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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('course_id');
            $table->integer('installment_number');
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->date('payment_date')->nullable();
            $table->enum('payment_method', ['cash', 'bank_transfer', 'check', 'online'])->default('cash');
            $table->enum('status', ['pending', 'paid', 'overdue', 'cancelled'])->default('pending');
            $table->uuid('collected_by');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('student_id');
            $table->index('course_id');
            $table->index('status');
            $table->index('collected_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
