<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BatchController extends Controller
{
    /**
     * Display a listing of batches.
     */
    public function index(Request $request)
    {
        try {
            $query = Batch::with(['course', 'branch', 'faculty', 'students']);

            // Filter by branch
            if ($request->has('branch_id') && !empty($request->branch_id)) {
                $query->where('branch_id', $request->branch_id);
            }

            // Filter by course
            if ($request->has('course_id') && !empty($request->course_id)) {
                $query->where('course_id', $request->course_id);
            }

            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $batches = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $batches,
                'message' => 'Batches fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batches',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created batch.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'course_id' => 'required|exists:courses,id',
                'branch_id' => 'required|exists:branches,id',
                'faculty_id' => 'required|exists:faculties,id',
                'max_students' => 'required|integer|min:1|max:200',
                'description' => 'nullable|string',
                'status' => 'nullable|in:active,completed,cancelled',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $batch = Batch::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $batch->load(['course', 'branch', 'faculty']),
                'message' => 'Batch created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified batch.
     */
    public function show($id)
    {
        try {
            $batch = Batch::with(['course', 'branch', 'faculty', 'students'])
                         ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $batch,
                'message' => 'Batch fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified batch.
     */
    public function update(Request $request, $id)
    {
        try {
            $batch = Batch::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after:start_date',
                'course_id' => 'sometimes|required|exists:courses,id',
                'branch_id' => 'sometimes|required|exists:branches,id',
                'faculty_id' => 'sometimes|required|exists:faculties,id',
                'max_students' => 'sometimes|required|integer|min:1|max:200',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:active,completed,cancelled',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $batch->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $batch->load(['course', 'branch', 'faculty']),
                'message' => 'Batch updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified batch.
     */
    public function destroy($id)
    {
        try {
            $batch = Batch::findOrFail($id);

            // Check if batch has students
            if ($batch->students()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete batch with enrolled students'
                ], 400);
            }

            $batch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Batch deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get batch statistics.
     */
    public function statistics($id)
    {
        try {
            $batch = Batch::with(['students', 'attendance'])->findOrFail($id);

            $stats = [
                'total_students' => $batch->students()->count(),
                'attendance_rate' => $this->calculateAttendanceRate($batch),
                'total_income' => $this->calculateTotalIncome($batch),
                'pending_dues' => $this->calculatePendingDues($batch),
                'exams_count' => $batch->exams()->count(),
                'upcoming_exams' => $batch->exams()->where('status', 'upcoming')->count(),
                'completed_exams' => $batch->exams()->where('status', 'completed')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Batch statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate attendance rate for a batch.
     */
    private function calculateAttendanceRate($batch)
    {
        $totalRecords = $batch->attendance()->count();
        if ($totalRecords === 0) return 0;

        $presentRecords = $batch->attendance()->where('status', 'present')->count();
        return round(($presentRecords / $totalRecords) * 100, 1);
    }

    /**
     * Calculate total income for a batch.
     */
    private function calculateTotalIncome($batch)
    {
        return $batch->students()->sum('final_fee');
    }

    /**
     * Calculate pending dues for a batch.
     */
    private function calculatePendingDues($batch)
    {
        return $batch->students()->get()->sum(function ($student) {
            $paidAmount = ($student->final_fee ?? 0) - ($student->discount_amount ?? 0);
            return max(0, ($student->total_fee ?? 0) - $paidAmount);
        });
    }
}

