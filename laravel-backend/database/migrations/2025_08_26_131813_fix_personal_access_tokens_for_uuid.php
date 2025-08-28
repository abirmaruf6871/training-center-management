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
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Drop the existing morphs columns
            $table->dropColumn(['tokenable_type', 'tokenable_id']);
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Recreate with proper types for UUID
            $table->string('tokenable_type');
            $table->uuid('tokenable_id');
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Drop the UUID columns
            $table->dropIndex(['tokenable_type', 'tokenable_id']);
            $table->dropColumn(['tokenable_type', 'tokenable_id']);
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Recreate with original morphs
            $table->morphs('tokenable');
        });
    }
};
