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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->enum('difficulty', ['easy', 'medium', 'hard']);
            $table->integer('time_limit')->comment('Time limit in minutes');
            $table->integer('passing_score')->comment('Passing score percentage');
            $table->integer('total_questions')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->uuid('created_by');
            $table->boolean('is_randomized')->default(false);
            $table->boolean('show_answers_after')->default(false);
            $table->boolean('allow_retake')->default(false);
            $table->integer('max_attempts')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->index(['category', 'difficulty']);
            $table->index(['is_active', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
