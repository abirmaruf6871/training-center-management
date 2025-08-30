<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::with(['branch', 'user']);

        // Filter by branch if specified
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // Filter by position
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Filter by employment type
        if ($request->has('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $staff = $query->orderBy('first_name')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $staff
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|uuid|exists:branches,id',
            'employee_id' => 'required|string|max:100|unique:staff,employee_id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:staff,email',
            'phone' => 'nullable|string|max:20',
            'position' => 'required|string|in:manager,teacher,accountant,receptionist,maintenance,other',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'required|date',
            'salary' => 'nullable|numeric|min:0',
            'employment_type' => 'required|string|in:full-time,part-time,contract',
            'status' => 'required|string|in:active,inactive,terminated',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $staff = Staff::create([
            'branch_id' => $request->branch_id,
            'user_id' => Auth::id(),
            'employee_id' => $request->employee_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'position' => $request->position,
            'department' => $request->department,
            'hire_date' => $request->hire_date,
            'salary' => $request->salary,
            'employment_type' => $request->employment_type,
            'status' => $request->status,
            'metadata' => $request->metadata
        ]);

        $staff->load(['branch', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Staff member created successfully',
            'data' => $staff
        ], 201);
    }

    public function show($id)
    {
        $staff = Staff::with(['branch', 'user'])->find($id);

        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff member not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $staff
        ]);
    }

    public function update(Request $request, $id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:staff,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'position' => 'sometimes|required|string|in:manager,teacher,accountant,receptionist,maintenance,other',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'sometimes|required|date',
            'salary' => 'nullable|numeric|min:0',
            'employment_type' => 'sometimes|required|string|in:full-time,part-time,contract',
            'status' => 'sometimes|required|string|in:active,inactive,terminated',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $staff->update($request->only([
            'first_name', 'last_name', 'email', 'phone', 'position', 'department',
            'hire_date', 'salary', 'employment_type', 'status', 'metadata'
        ]));

        $staff->load(['branch', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Staff member updated successfully',
            'data' => $staff
        ]);
    }

    public function destroy($id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff member not found'
            ], 404);
        }

        $staff->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff member deleted successfully'
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

        $staff = $branch->staff()
            ->with(['user'])
            ->orderBy('first_name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $staff
        ]);
    }
}

