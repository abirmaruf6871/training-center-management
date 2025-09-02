<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExamController extends Controller
{
    /**
     * Display a listing of exams.
     */
    public function index(Request $request)
    {
        try {
            $query = Exam::with(['batch']);

            // Filter by batch
            if ($request->has('batch_id') && !empty($request->batch_id)) {
                $query->where('batch_id', $request->batch_id);
            }

            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->where('exam_date', '>=', $request->start_date);
            }

            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->where('exam_date', '<=', $request->end_date);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $exams = $query->orderBy('exam_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $exams,
                'message' => 'Exams fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created exam.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'batch_id' => 'required|exists:batches,id',
                'exam_date' => 'required|date|after:today',
                'total_marks' => 'required|integer|min:1|max:1000',
                'pass_marks' => 'required|integer|min:1',
                'duration_minutes' => 'nullable|integer|min:1|max:480',
                'description' => 'nullable|string',
                'status' => 'nullable|in:upcoming,ongoing,completed',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validate pass marks cannot exceed total marks
            if ($request->pass_marks > $request->total_marks) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pass marks cannot exceed total marks'
                ], 422);
            }

            $exam = Exam::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $exam->load(['batch']),
                'message' => 'Exam created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified exam.
     */
    public function show($id)
    {
        try {
            $exam = Exam::with(['batch', 'results.student'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $exam,
                'message' => 'Exam fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Exam not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified exam.
     */
    public function update(Request $request, $id)
    {
        try {
            $exam = Exam::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'exam_date' => 'sometimes|required|date',
                'total_marks' => 'sometimes|required|integer|min:1|max:1000',
                'pass_marks' => 'sometimes|required|integer|min:1',
                'duration_minutes' => 'nullable|integer|min:1|max:480',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:upcoming,ongoing,completed',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validate pass marks cannot exceed total marks
            if ($request->has('pass_marks') && $request->has('total_marks')) {
                if ($request->pass_marks > $request->total_marks) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Pass marks cannot exceed total marks'
                    ], 422);
                }
            } elseif ($request->has('pass_marks') && $request->pass_marks > $exam->total_marks) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pass marks cannot exceed total marks'
                ], 422);
            } elseif ($request->has('total_marks') && $exam->pass_marks > $request->total_marks) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pass marks cannot exceed total marks'
                ], 422);
            }

            $exam->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $exam->load(['batch']),
                'message' => 'Exam updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified exam.
     */
    public function destroy($id)
    {
        try {
            $exam = Exam::findOrFail($id);

            // Check if exam has results
            if ($exam->results()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete exam with results'
                ], 400);
            }

            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start an exam.
     */
    public function startExam($id)
    {
        try {
            $exam = Exam::findOrFail($id);

            if ($exam->status !== 'upcoming') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only upcoming exams can be started'
                ], 400);
            }

            $exam->update(['status' => 'ongoing']);

            return response()->json([
                'success' => true,
                'data' => $exam->load(['batch']),
                'message' => 'Exam started successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete an exam.
     */
    public function completeExam($id)
    {
        try {
            $exam = Exam::findOrFail($id);

            if ($exam->status !== 'ongoing') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only ongoing exams can be completed'
                ], 400);
            }

            $exam->update(['status' => 'completed']);

            return response()->json([
                'success' => true,
                'data' => $exam->load(['batch']),
                'message' => 'Exam completed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get exam statistics.
     */
    public function statistics($id)
    {
        try {
            $exam = Exam::with(['batch', 'results'])->findOrFail($id);

            $stats = [
                'total_students' => $exam->batch->students()->count(),
                'students_with_results' => $exam->results()->count(),
                'students_passed' => $exam->results()->where('marks_obtained', '>=', $exam->pass_marks)->count(),
                'students_failed' => $exam->results()->where('marks_obtained', '<', $exam->pass_marks)->count(),
                'average_marks' => $exam->results()->avg('marks_obtained') ?? 0,
                'highest_marks' => $exam->results()->max('marks_obtained') ?? 0,
                'lowest_marks' => $exam->results()->min('marks_obtained') ?? 0,
                'pass_percentage' => 0
            ];

            if ($stats['students_with_results'] > 0) {
                $stats['pass_percentage'] = round(($stats['students_passed'] / $stats['students_with_results']) * 100, 1);
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Exam statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch exam statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


