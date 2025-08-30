<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class IncomeController extends Controller
{
    public function index(Request $request)
    {
        $query = Income::with(['branch', 'user']);

        // Filter by branch if specified
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('income_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('income_date', '<=', $request->end_date);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $incomes = $query->orderBy('income_date', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $incomes
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|uuid|exists:branches,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string|in:tuition,other,donation,workshop,course_sale',
            'payment_method' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:100',
            'income_date' => 'required|date',
            'status' => 'required|string|in:received,pending,cancelled',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $income = Income::create([
            'branch_id' => $request->branch_id,
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'amount' => $request->amount,
            'type' => $request->type,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'income_date' => $request->income_date,
            'status' => $request->status,
            'metadata' => $request->metadata
        ]);

        $income->load(['branch', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Income created successfully',
            'data' => $income
        ], 201);
    }

    public function show($id)
    {
        $income = Income::with(['branch', 'user'])->find($id);

        if (!$income) {
            return response()->json([
                'success' => false,
                'message' => 'Income not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $income
        ]);
    }

    public function update(Request $request, $id)
    {
        $income = Income::find($id);

        if (!$income) {
            return response()->json([
                'success' => false,
                'message' => 'Income not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'type' => 'sometimes|required|string|in:tuition,other,donation,workshop,course_sale',
            'payment_method' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:100',
            'income_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|string|in:received,pending,cancelled',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $income->update($request->only([
            'title', 'description', 'amount', 'type', 'payment_method',
            'reference_number', 'income_date', 'status', 'metadata'
        ]));

        $income->load(['branch', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Income updated successfully',
            'data' => $income
        ]);
    }

    public function destroy($id)
    {
        $income = Income::find($id);

        if (!$income) {
            return response()->json([
                'success' => false,
                'message' => 'Income not found'
            ], 404);
        }

        $income->delete();

        return response()->json([
            'success' => true,
            'message' => 'Income deleted successfully'
        ]);
    }

    public function byBranch($branchId)
    {
        $branch = Branch::find($branchId);

        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found'
            ], 404);
        }

        $incomes = $branch->incomes()
            ->with(['user'])
            ->orderBy('income_date', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $incomes
        ]);
    }
}

