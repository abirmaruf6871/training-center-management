<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'username' => 'admin',
            'email' => 'admin@acmr.com',
            'password' => Hash::make('admin123'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
            'phone' => '01611153510',
        ]);

        // Create a manager user
        User::create([
            'username' => 'manager',
            'email' => 'manager@acmr.com',
            'password' => Hash::make('manager123'),
            'first_name' => 'Manager',
            'last_name' => 'User',
            'role' => 'manager',
        ]);

        // Create a student user
        User::create([
            'username' => 'student',
            'email' => 'student@acmr.com',
            'password' => Hash::make('student123'),
            'first_name' => 'Student',
            'last_name' => 'User',
            'role' => 'student',
        ]);

        $this->command->info('Admin, Manager, and Student users created successfully!');
    }
}
