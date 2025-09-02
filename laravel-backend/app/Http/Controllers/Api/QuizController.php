<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    /**
     * Display a listing of quizzes.
     */
    public function index(Request $request)
    {
        try {
            $query = Quiz::with(['creator', 'questions']);

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $query->search($request->search);
            }

            // Apply category filter
            if ($request->has('category') && !empty($request->category)) {
                $query->byCategory($request->category);
            }

            // Apply difficulty filter
            if ($request->has('difficulty') && !empty($request->difficulty)) {
                $query->byDifficulty($request->difficulty);
            }

            // For students, only show available quizzes
            if (auth()->user()->role === 'student') {
                $query->available();
            }

            $quizzes = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $quizzes,
                'message' => 'Quizzes fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quizzes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created quiz.
     */
    public function store(Request $request)
    {
        try {
            // Check if user has permission to create quizzes
            if (!in_array(auth()->user()->role, ['admin', 'manager'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to create quizzes'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'category' => 'required|string|max:100',
                'difficulty' => 'required|in:easy,medium,hard',
                'time_limit' => 'required|integer|min:1|max:300',
                'passing_score' => 'required|integer|min:0|max:100',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'is_active' => 'boolean',
                'is_randomized' => 'boolean',
                'show_answers_after' => 'boolean',
                'allow_retake' => 'boolean',
                'max_attempts' => 'nullable|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $quiz = Quiz::create([
                ...$request->validated(),
                'created_by' => auth()->id(),
                'total_questions' => 0
            ]);

            return response()->json([
                'success' => true,
                'data' => $quiz->load('creator'),
                'message' => 'Quiz created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified quiz.
     */
    public function show($id)
    {
        try {
            $quiz = Quiz::with(['creator', 'questions.ordered'])->findOrFail($id);

            // For students, check if quiz is available
            if (auth()->user()->role === 'student' && !$quiz->is_available) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quiz is not available'
                ], 403);
            }

            // Hide correct answers for students
            if (auth()->user()->role === 'student') {
                $quiz->questions->each(function ($question) {
                    unset($question->correct_answer);
                });
            }

            return response()->json([
                'success' => true,
                'data' => $quiz,
                'message' => 'Quiz fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified quiz.
     */
    public function update(Request $request, $id)
    {
        try {
            // Check if user has permission to update quizzes
            if (!in_array(auth()->user()->role, ['admin', 'manager'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update quizzes'
                ], 403);
            }

            $quiz = Quiz::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'category' => 'sometimes|required|string|max:100',
                'difficulty' => 'sometimes|required|in:easy,medium,hard',
                'time_limit' => 'sometimes|required|integer|min:1|max:300',
                'passing_score' => 'sometimes|required|integer|min:0|max:100',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'is_active' => 'boolean',
                'is_randomized' => 'boolean',
                'show_answers_after' => 'boolean',
                'allow_retake' => 'boolean',
                'max_attempts' => 'nullable|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $quiz->update($request->validated());

            return response()->json([
                'success' => true,
                'data' => $quiz->load('creator'),
                'message' => 'Quiz updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified quiz.
     */
    public function destroy($id)
    {
        try {
            // Check if user has permission to delete quizzes
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete quizzes'
                ], 403);
            }

            $quiz = Quiz::findOrFail($id);

            // Check if quiz has attempts
            if ($quiz->attempts()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete quiz with existing attempts'
                ], 422);
            }

            $quiz->delete();

            return response()->json([
                'success' => true,
                'message' => 'Quiz deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start a quiz attempt.
     */
    public function startAttempt(Request $request, $id)
    {
        try {
            $quiz = Quiz::findOrFail($id);

            // Check if user is a student
            if (auth()->user()->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only students can attempt quizzes'
                ], 403);
            }

            // Check if quiz is available
            if (!$quiz->is_available) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quiz is not available'
                ], 403);
            }

            // Check if user can attempt the quiz
            if (!$quiz->canBeAttemptedBy(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot attempt this quiz'
                ], 403);
            }

            // Check for existing in-progress attempt
            $existingAttempt = QuizAttempt::where([
                'quiz_id' => $quiz->id,
                'student_id' => auth()->id(),
                'status' => QuizAttempt::STATUS_IN_PROGRESS
            ])->first();

            if ($existingAttempt) {
                return response()->json([
                    'success' => true,
                    'data' => $existingAttempt,
                    'message' => 'Resuming existing attempt'
                ]);
            }

            // Create new attempt
            $attempt = QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'student_id' => auth()->id(),
                'status' => QuizAttempt::STATUS_IN_PROGRESS,
                'started_at' => now(),
                'score' => 0,
                'total_score' => $quiz->total_questions,
                'percentage' => 0,
                'time_taken' => 0,
                'is_passed' => false
            ]);

            $attempt->start();

            return response()->json([
                'success' => true,
                'data' => $attempt,
                'message' => 'Quiz attempt started successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start quiz attempt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit quiz answers.
     */
    public function submitAttempt(Request $request, $id)
    {
        try {
            $attempt = QuizAttempt::where([
                'quiz_id' => $id,
                'student_id' => auth()->id(),
                'status' => QuizAttempt::STATUS_IN_PROGRESS
            ])->firstOrFail();

            $validator = Validator::make($request->all(), [
                'answers' => 'required|array',
                'answers.*' => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $attempt->complete($request->answers);

            return response()->json([
                'success' => true,
                'data' => $attempt->load('quiz'),
                'message' => 'Quiz submitted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get quiz statistics for admin/manager.
     */
    public function getStats($id)
    {
        try {
            // Check if user has permission to view stats
            if (!in_array(auth()->user()->role, ['admin', 'manager'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view quiz statistics'
                ], 403);
            }

            $quiz = Quiz::with(['attempts'])->findOrFail($id);

            $stats = [
                'total_attempts' => $quiz->attempts()->count(),
                'completed_attempts' => $quiz->attempts()->completed()->count(),
                'passed_attempts' => $quiz->attempts()->passed()->count(),
                'average_score' => $quiz->attempts()->completed()->avg('percentage') ?? 0,
                'average_time' => $quiz->attempts()->completed()->avg('time_taken') ?? 0,
                'pass_rate' => $quiz->attempts()->completed()->count() > 0 
                    ? round(($quiz->attempts()->passed()->count() / $quiz->attempts()->completed()->count()) * 100, 1)
                    : 0
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Quiz statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quiz statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

