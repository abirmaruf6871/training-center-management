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
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('category', ['rent', 'utilities', 'salary', 'supplies', 'marketing', 'maintenance', 'other']);
            $table->date('expense_date');
            $table->uuid('branch_id');
            $table->uuid('created_by');
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('branch_id');
            $table->index('category');
            $table->index('expense_date');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
