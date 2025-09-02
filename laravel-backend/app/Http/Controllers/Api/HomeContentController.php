<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class HomeContentController extends Controller
{
    /**
     * Display a listing of home content sections
     */
    public function index()
    {
        $content = HomeContent::active()->ordered()->get();

        return response()->json([
            'data' => $content
        ]);
    }

    /**
     * Display the specified home content section
     */
    public function show($id)
    {
        $content = HomeContent::findOrFail($id);

        return response()->json([
            'data' => $content
        ]);
    }

    /**
     * Update the specified home content section
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        // Only admin can update home content
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $content = HomeContent::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'content' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:1'
        ]);

        $content->update($validated);

        return response()->json([
            'message' => 'Home content updated successfully',
            'data' => $content->fresh()
        ]);
    }

    /**
     * Get content by section name
     */
    public function getBySection($section)
    {
        $content = HomeContent::bySection($section)->active()->first();

        if (!$content) {
            return response()->json([
                'message' => 'Section not found'
            ], 404);
        }

        return response()->json([
            'data' => $content
        ]);
    }

    /**
     * Initialize default home content sections
     */
    public function initialize()
    {
        $user = Auth::user();
        
        // Only admin can initialize home content
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $defaultSections = [
            [
                'section' => 'hero',
                'title' => 'Hero Section',
                'subtitle' => 'Main hero section of the home page',
                'content' => [
                    'heading' => 'Find Medical Courses & Develop Your Skills',
                    'subtitle' => 'Premium Online & Offline Courses from Bangladesh & International Students.',
                    'search_placeholder' => 'Search from 1000+ courses',
                    'cta_text' => 'Find Course'
                ],
                'is_active' => true,
                'order' => 1
            ],
            [
                'section' => 'features',
                'title' => 'Features Section',
                'subtitle' => 'Key features and benefits',
                'content' => [
                    'title' => 'Why Choose Us',
                    'features' => [
                        [
                            'icon' => 'users',
                            'title' => 'Learn With Experts',
                            'description' => 'Gain valuable insights from industry leaders.'
                        ],
                        [
                            'icon' => 'book-open',
                            'title' => 'Hands-On Skill Builder',
                            'description' => 'Practice real-world scenarios to master your craft.'
                        ],
                        [
                            'icon' => 'graduation-cap',
                            'title' => 'Get Online Certificate',
                            'description' => 'Receive a recognized certificate upon completion.'
                        ],
                        [
                            'icon' => 'users',
                            'title' => 'Low Clinical Batches',
                            'description' => 'Small class sizes for personalized attention.'
                        ]
                    ]
                ],
                'is_active' => true,
                'order' => 2
            ],
            [
                'section' => 'courses',
                'title' => 'Popular Courses Section',
                'subtitle' => 'Featured courses display',
                'content' => [
                    'title' => 'Our Most Popular Courses',
                    'description' => 'Discover our top-rated courses designed by industry experts',
                    'categories' => ['All Categories', 'Development', 'Design', 'Marketing', 'Business', 'Photography', 'Music']
                ],
                'is_active' => true,
                'order' => 3
            ],
            [
                'section' => 'cta',
                'title' => 'Call to Action Section',
                'subtitle' => 'Main CTA banner',
                'content' => [
                    'title' => 'Finding Your Right Courses',
                    'subtitle' => 'Unlock Your Powerful By Joining Our Vibrant Learning Community',
                    'button_text' => 'Get Started'
                ],
                'is_active' => true,
                'order' => 4
            ],
            [
                'section' => 'instructors',
                'title' => 'Instructors Section',
                'subtitle' => 'Featured instructors display',
                'content' => [
                    'title' => 'Our Top Class & Expert Instructors In One Place',
                    'description' => 'Learn from industry experts who are passionate about sharing their knowledge and experience.'
                ],
                'is_active' => true,
                'order' => 5
            ],
            [
                'section' => 'newsletter',
                'title' => 'Newsletter Section',
                'subtitle' => 'Email subscription section',
                'content' => [
                    'title' => 'Want To Stay Informed About New Courses & Study?',
                    'placeholder' => 'Enter your email',
                    'button_text' => 'Subscribe Now'
                ],
                'is_active' => true,
                'order' => 6
            ]
        ];

        foreach ($defaultSections as $sectionData) {
            HomeContent::updateOrCreate(
                ['section' => $sectionData['section']],
                $sectionData
            );
        }

        return response()->json([
            'message' => 'Home content initialized successfully',
            'data' => HomeContent::active()->ordered()->get()
        ]);
    }
}

