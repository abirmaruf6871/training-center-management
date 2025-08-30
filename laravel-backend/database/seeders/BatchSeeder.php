<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Branch;
use App\Models\Faculty;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing courses, branches, and faculties
        $courses = Course::all();
        $branches = Branch::all();
        $faculties = Faculty::all();

        if ($courses->isEmpty() || $branches->isEmpty() || $faculties->isEmpty()) {
            $this->command->warn('Please run CourseSeeder, BranchSeeder, and FacultySeeder first!');
            return;
        }

        $batches = [
            [
                'name' => 'BMT-2024-01',
                'description' => 'First batch of Basic Medical Training 2024',
                'start_date' => '2024-01-15',
                'end_date' => '2024-07-15',
                'course_id' => $courses->where('name', 'Basic Medical Training')->first()?->id ?? $courses->first()->id,
                'branch_id' => $branches->where('name', 'Dhaka')->first()?->id ?? $branches->first()->id,
                'faculty_id' => $faculties->where('specialization', 'Basic Medical Training')->first()?->id ?? $faculties->first()->id,
                'max_students' => 25,
                'current_students' => 18,
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'name' => 'NF-2024-01',
                'description' => 'First batch of Nursing Fundamentals 2024',
                'start_date' => '2024-02-01',
                'end_date' => '2024-08-01',
                'course_id' => $courses->where('name', 'Nursing Fundamentals')->first()?->id ?? $courses->first()->id,
                'branch_id' => $branches->where('name', 'Mymensingh')->first()?->id ?? $branches->first()->id,
                'faculty_id' => $faculties->where('specialization', 'Nursing Fundamentals')->first()?->id ?? $faculties->first()->id,
                'max_students' => 20,
                'current_students' => 15,
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'name' => 'PP-2024-01',
                'description' => 'First batch of Pharmacy Practice 2024',
                'start_date' => '2024-01-20',
                'end_date' => '2024-07-20',
                'course_id' => $courses->where('name', 'Pharmacy Practice')->first()?->id ?? $courses->first()->id,
                'branch_id' => $branches->where('name', 'Kishoreganj')->first()?->id ?? $branches->first()->id,
                'faculty_id' => $faculties->where('specialization', 'Pharmacy Practice')->first()?->id ?? $faculties->first()->id,
                'max_students' => 18,
                'current_students' => 12,
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'name' => 'MLT-2024-01',
                'description' => 'First batch of Medical Laboratory Technology 2024',
                'start_date' => '2024-02-15',
                'end_date' => '2024-08-15',
                'course_id' => $courses->where('name', 'Medical Laboratory Technology')->first()?->id ?? $courses->first()->id,
                'branch_id' => $branches->where('name', 'Dhaka')->first()?->id ?? $branches->first()->id,
                'faculty_id' => $faculties->where('specialization', 'Medical Laboratory Technology')->first()?->id ?? $faculties->first()->id,
                'max_students' => 22,
                'current_students' => 16,
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'name' => 'PT-2024-01',
                'description' => 'First batch of Physiotherapy 2024',
                'start_date' => '2024-03-01',
                'end_date' => '2024-09-01',
                'course_id' => $courses->where('name', 'Physiotherapy')->first()?->id ?? $courses->first()->id,
                'branch_id' => $branches->where('name', 'Mymensingh')->first()?->id ?? $branches->first()->id,
                'faculty_id' => $faculties->where('specialization', 'Physiotherapy')->first()?->id ?? $faculties->first()->id,
                'max_students' => 20,
                'current_students' => 14,
                'status' => 'active',
                'is_active' => true,
            ],
        ];

        foreach ($batches as $batch) {
            Batch::create($batch);
        }
    }
}

