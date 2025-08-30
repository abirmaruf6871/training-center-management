<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FacultyController extends Controller
{
    /**
     * Display a listing of faculties.
     */
    public function index(Request $request)
    {
        try {
            $query = Faculty::query();

            // Filter by specialization
            if ($request->has('specialization') && !empty($request->specialization)) {
                $query->where('specialization', 'like', '%' . $request->specialization . '%');
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $faculties = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $faculties,
                'message' => 'Faculties fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch faculties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created faculty.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:faculties,email',
                'phone' => 'nullable|string|max:20',
                'specialization' => 'required|string|max:255',
                'qualification' => 'nullable|string|max:255',
                'experience_years' => 'nullable|integer|min:0|max:50',
                'bio' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $faculty = Faculty::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create faculty',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified faculty.
     */
    public function show($id)
    {
        try {
            $faculty = Faculty::with(['batches'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified faculty.
     */
    public function update(Request $request, $id)
    {
        try {
            $faculty = Faculty::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:faculties,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'specialization' => 'sometimes|required|string|max:255',
                'qualification' => 'nullable|string|max:255',
                'experience_years' => 'nullable|integer|min:0|max:50',
                'bio' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $faculty->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update faculty',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified faculty.
     */
    public function destroy($id)
    {
        try {
            $faculty = Faculty::findOrFail($id);

            // Check if faculty has batches
            if ($faculty->batches()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete faculty with assigned batches'
                ], 400);
            }

            $faculty->delete();

            return response()->json([
                'success' => true,
                'message' => 'Faculty deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete faculty',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get faculty statistics.
     */
    public function statistics($id)
    {
        try {
            $faculty = Faculty::with(['batches'])->findOrFail($id);

            $stats = [
                'total_batches' => $faculty->batches()->count(),
                'active_batches' => $faculty->batches()->where('is_active', true)->count(),
                'completed_batches' => $faculty->batches()->where('status', 'completed')->count(),
                'total_students' => $faculty->batches()->withCount('students')->get()->sum('students_count'),
                'experience_years' => $faculty->experience_years,
                'specialization' => $faculty->specialization,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Faculty statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch faculty statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

