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
        Schema::table('incomes', function (Blueprint $table) {
            // Add new fields
            $table->string('title')->after('id');
            $table->string('type')->default('tuition')->after('title');
            $table->date('income_date')->after('type');
            $table->uuid('user_id')->nullable()->after('branch_id');
            $table->json('metadata')->nullable()->after('notes');
            
            // Add indexes
            $table->index(['branch_id', 'income_date']);
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            // Remove added fields
            $table->dropColumn(['title', 'type', 'income_date', 'user_id', 'metadata']);
            
            // Remove indexes
            $table->dropIndex(['branch_id', 'income_date']);
            $table->dropIndex(['type', 'status']);
        });
    }
};
