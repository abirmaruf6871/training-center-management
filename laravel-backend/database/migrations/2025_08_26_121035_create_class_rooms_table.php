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
        Schema::create('classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('course_id');
            $table->uuid('batch_id');
            $table->uuid('branch_id');
            $table->uuid('faculty_id');
            $table->date('class_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('topic');
            $table->text('description')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('course_id');
            $table->index('batch_id');
            $table->index('branch_id');
            $table->index('faculty_id');
            $table->index('class_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
