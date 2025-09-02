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
        Schema::create('home_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('section')->unique()->comment('Section identifier (hero, features, courses, etc.)');
            $table->string('title')->comment('Section title for admin reference');
            $table->string('subtitle')->nullable()->comment('Section subtitle for admin reference');
            $table->text('description')->nullable()->comment('Section description for admin reference');
            $table->json('content')->comment('JSON content for the section');
            $table->boolean('is_active')->default(true)->comment('Whether the section is active');
            $table->integer('order')->default(0)->comment('Display order of the section');
            $table->timestamps();

            $table->index(['section', 'is_active']);
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_content');
    }
};

