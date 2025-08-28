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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username')->unique();
            $table->string('email')->unique()->nullable();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('profile_image_url', 500)->nullable();
            $table->enum('role', ['admin', 'manager', 'accountant', 'faculty', 'student'])->default('student');
            $table->uuid('branch_id')->nullable();
            $table->string('phone', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            $table->index('branch_id');
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
