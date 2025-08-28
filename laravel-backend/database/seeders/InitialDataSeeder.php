<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create main branch
        $branch = Branch::create([
            'id' => Str::uuid(),
            'name' => 'Main Training Center',
            'address' => '123 Training Street, City, Country',
            'phone' => '+1234567890',
            'email' => 'info@trainingcenter.com',
            'is_active' => true,
        ]);

        // Create admin user
        User::create([
            'id' => Str::uuid(),
            'username' => 'admin',
            'email' => 'admin@trainingcenter.com',
            'password' => Hash::make('admin123'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
            'branch_id' => $branch->id,
            'is_active' => true,
        ]);

        // Create manager user
        User::create([
            'id' => Str::uuid(),
            'username' => 'manager',
            'email' => 'manager@trainingcenter.com',
            'password' => Hash::make('manager123'),
            'first_name' => 'Manager',
            'last_name' => 'User',
            'role' => 'manager',
            'branch_id' => $branch->id,
            'is_active' => true,
        ]);

        // Create accountant user
        User::create([
            'id' => Str::uuid(),
            'username' => 'accountant',
            'email' => 'accountant@trainingcenter.com',
            'password' => Hash::make('accountant123'),
            'first_name' => 'Accountant',
            'last_name' => 'User',
            'role' => 'accountant',
            'branch_id' => $branch->id,
            'is_active' => true,
        ]);

        // Create faculty user
        User::create([
            'id' => Str::uuid(),
            'username' => 'faculty',
            'email' => 'faculty@trainingcenter.com',
            'password' => Hash::make('faculty123'),
            'first_name' => 'Faculty',
            'last_name' => 'User',
            'role' => 'faculty',
            'branch_id' => $branch->id,
            'is_active' => true,
        ]);

        // Update branch with manager
        $manager = User::where('username', 'manager')->first();
        $branch->update(['manager_id' => $manager->id]);

        $this->command->info('Initial data seeded successfully!');
        $this->command->info('Admin credentials: admin / admin123');
        $this->command->info('Manager credentials: manager / manager123');
        $this->command->info('Accountant credentials: accountant / accountant123');
        $this->command->info('Faculty credentials: faculty / faculty123');
    }
}
