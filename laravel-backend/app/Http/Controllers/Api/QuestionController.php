<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class QuestionController extends Controller
{
    /**
     * Display a listing of questions with filters
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Only admin and manager can access questions
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Question::query();

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $query->where('question_text', 'like', '%' . $request->search . '%');
        }

        // Apply type filter
        if ($request->has('type') && $request->type && $request->type !== 'all') {
            $query->where('question_type', $request->type);
        }

        // Apply quiz filter if specified
        if ($request->has('quiz_id') && $request->quiz_id) {
            $query->where('quiz_id', $request->quiz_id);
        }

        $questions = $query->orderBy('order')->paginate(20);

        return response()->json([
            'data' => $questions->items(),
            'total' => $questions->total(),
            'per_page' => $questions->perPage(),
            'current_page' => $questions->currentPage(),
            'last_page' => $questions->lastPage(),
        ]);
    }

    /**
     * Store a newly created question
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Only admin and manager can create questions
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'question_text' => 'required|string|max:1000',
            'question_type' => ['required', Rule::in([
                'mcq', 'multiple_answer', 'true_false', 'multiple_true_false', 
                'fill_blanks', 'matching', 'descriptive'
            ])],
            'options' => 'nullable|array',
            'options.*' => 'string|max:255',
            'correct_answer' => 'nullable|string|max:1000',
            'points' => 'required|integer|min:1|max:100',
            'order' => 'nullable|integer|min:1',
            'explanation' => 'nullable|string|max:1000',
            'is_required' => 'boolean',
            'quiz_id' => 'nullable|uuid|exists:quizzes,id',
            'sub_statements' => 'nullable|array',
            'sub_statements.*.text' => 'required|string|max:500',
            'sub_statements.*.is_true' => 'required|boolean',
            'sub_statements.*.points' => 'required|integer|min:1|max:10',
        ]);

        // Set default order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = Question::where('quiz_id', $validated['quiz_id'] ?? null)->max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        $question = Question::create($validated);

        return response()->json([
            'message' => 'Question created successfully',
            'data' => $question->fresh()
        ], 201);
    }

    /**
     * Display the specified question
     */
    public function show($id)
    {
        $user = Auth::user();
        
        // Only admin and manager can view questions
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question = Question::findOrFail($id);

        return response()->json([
            'data' => $question
        ]);
    }

    /**
     * Update the specified question
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        // Only admin and manager can update questions
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question = Question::findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'sometimes|required|string|max:1000',
            'question_type' => ['sometimes', 'required', Rule::in([
                'mcq', 'multiple_answer', 'true_false', 'multiple_true_false', 
                'fill_blanks', 'matching', 'descriptive'
            ])],
            'options' => 'nullable|array',
            'options.*' => 'string|max:255',
            'correct_answer' => 'nullable|string|max:1000',
            'points' => 'sometimes|required|integer|min:1|max:100',
            'order' => 'sometimes|required|integer|min:1',
            'explanation' => 'nullable|string|max:1000',
            'is_required' => 'sometimes|boolean',
            'quiz_id' => 'nullable|uuid|exists:quizzes,id',
            'sub_statements' => 'nullable|array',
            'sub_statements.*.text' => 'required|string|max:500',
            'sub_statements.*.is_true' => 'required|boolean',
            'sub_statements.*.points' => 'required|integer|min:1|max:10',
        ]);

        $question->update($validated);

        return response()->json([
            'message' => 'Question updated successfully',
            'data' => $question->fresh()
        ]);
    }

    /**
     * Remove the specified question
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        // Only admin and manager can delete questions
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question = Question::findOrFail($id);

        // Check if question is being used in any active quiz attempts
        if ($question->quiz && $question->quiz->attempts()->where('status', 'in_progress')->exists()) {
            return response()->json([
                'message' => 'Cannot delete question while it is being used in active quiz attempts'
            ], 422);
        }

        $question->delete();

        return response()->json([
            'message' => 'Question deleted successfully'
        ]);
    }
}
