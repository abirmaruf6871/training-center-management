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
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('quiz_id');
            $table->text('question_text');
            $table->enum('question_type', [
                'mcq',
                'multiple_answer',
                'true_false',
                'multiple_true_false',
                'fill_blanks',
                'matching',
                'descriptive'
            ]);
            $table->json('options')->nullable()->comment('JSON array of options for multiple choice questions');
            $table->json('correct_answer')->nullable()->comment('JSON array of correct answers');
            $table->json('sub_statements')->nullable()->comment('JSON array of sub-statements for multiple true/false questions');
            $table->integer('points')->default(1);
            $table->integer('order')->default(0);
            $table->text('explanation')->nullable();
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
            $table->index(['quiz_id', 'order']);
            $table->index('question_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
