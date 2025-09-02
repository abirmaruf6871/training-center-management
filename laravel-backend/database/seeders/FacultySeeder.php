<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Faculty;

class FacultySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faculties = [
            [
                'name' => 'Dr. Ahmed Rahman',
                'email' => 'ahmed.rahman@academy.com',
                'phone' => '+880-1712-345678',
                'specialization' => 'Basic Medical Training',
                'qualification' => 'MBBS, MD',
                'experience_years' => 8,
                'bio' => 'Experienced medical professional with expertise in basic medical training and emergency care.',
                'is_active' => true,
            ],
            [
                'name' => 'Prof. Fatima Begum',
                'email' => 'fatima.begum@academy.com',
                'phone' => '+880-1812-345679',
                'specialization' => 'Nursing Fundamentals',
                'qualification' => 'BSc Nursing, MSc Nursing',
                'experience_years' => 12,
                'bio' => 'Senior nursing instructor with extensive experience in clinical practice and education.',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Mohammad Ali',
                'email' => 'mohammad.ali@academy.com',
                'phone' => '+880-1912-345680',
                'specialization' => 'Pharmacy Practice',
                'qualification' => 'BPharm, MPharm',
                'experience_years' => 6,
                'bio' => 'Pharmacy professional specializing in pharmaceutical care and medication management.',
                'is_active' => true,
            ],
            [
                'name' => 'Ms. Ayesha Khan',
                'email' => 'ayesha.khan@academy.com',
                'phone' => '+880-1612-345681',
                'specialization' => 'Medical Laboratory Technology',
                'qualification' => 'BSc MLT, MSc MLT',
                'experience_years' => 5,
                'bio' => 'Laboratory technologist with expertise in diagnostic procedures and quality control.',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Omar Hassan',
                'email' => 'omar.hassan@academy.com',
                'phone' => '+880-1512-345682',
                'specialization' => 'Physiotherapy',
                'qualification' => 'BPT, MPT',
                'experience_years' => 7,
                'bio' => 'Physiotherapist specializing in rehabilitation and therapeutic exercises.',
                'is_active' => true,
            ],
        ];

        foreach ($faculties as $faculty) {
            Faculty::create($faculty);
        }
    }
}


