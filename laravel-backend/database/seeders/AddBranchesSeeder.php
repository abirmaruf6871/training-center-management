<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use Illuminate\Support\Str;

class AddBranchesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            [
                'id' => Str::uuid(),
                'name' => 'Mymensingh',
                'address' => 'Mymensingh City, Bangladesh',
                'phone' => '+880-1XXX-XXXXXX',
                'email' => 'mymensingh@trainingcenter.com',
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Dhaka',
                'address' => 'Dhaka City, Bangladesh',
                'phone' => '+880-1XXX-XXXXXX',
                'email' => 'dhaka@trainingcenter.com',
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Kishoreganj',
                'address' => 'Kishoreganj City, Bangladesh',
                'phone' => '+880-1XXX-XXXXXX',
                'email' => 'kishoreganj@trainingcenter.com',
                'is_active' => true,
            ],
        ];

        foreach ($branches as $branchData) {
            Branch::create($branchData);
        }

        $this->command->info('Three branches added successfully!');
    }
}
