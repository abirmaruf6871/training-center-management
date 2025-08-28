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
        Schema::create('batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('course_id');
            $table->uuid('branch_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('max_students')->default(30);
            $table->integer('current_students')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('course_id');
            $table->index('branch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
