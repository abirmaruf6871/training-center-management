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
        Schema::table('expenses', function (Blueprint $table) {
            // Add new fields
            $table->uuid('user_id')->nullable()->after('branch_id');
            $table->string('payment_method')->nullable()->after('category');
            $table->string('reference_number')->nullable()->after('payment_method');
            $table->json('metadata')->nullable()->after('notes');
            
            // Add indexes
            $table->index(['branch_id', 'expense_date']);
            $table->index(['category', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Remove added fields
            $table->dropColumn(['user_id', 'payment_method', 'reference_number', 'metadata']);
            
            // Remove indexes
            $table->dropIndex(['branch_id', 'expense_date']);
            $table->dropIndex(['category', 'status']);
        });
    }
};
