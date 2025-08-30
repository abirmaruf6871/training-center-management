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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('recipient_id');
            $table->string('type'); // payment_reminder, class_reminder, exam_notice, batch_starting, general
            $table->text('message');
            $table->string('channel'); // sms, email, both
            $table->string('status')->default('sent'); // sent, failed, pending
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('recipient_id')->references('id')->on('students')->onDelete('cascade');
            
            $table->index(['recipient_id', 'type']);
            $table->index(['channel', 'status']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
