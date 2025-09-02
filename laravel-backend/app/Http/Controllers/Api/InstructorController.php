<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InstructorController extends Controller
{
    /**
     * Display a listing of instructors.
     */
    public function index(Request $request): JsonResponse
    {
        // For now, return empty data to fix the route error
        return response()->json([
            'data' => [],
            'message' => 'Instructors retrieved successfully'
        ]);
    }

    /**
     * Display the specified instructor.
     */
    public function show(string $id): JsonResponse
    {
        // For now, return empty data to fix the route error
        return response()->json([
            'data' => null,
            'message' => 'Instructor not found'
        ]);
    }
}

