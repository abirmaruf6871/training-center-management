<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    /**
     * Display a listing of branches.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $branches = Branch::where('is_active', true)->get(['id', 'name', 'address', 'phone', 'email']);
            return response()->json($branches);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch branches', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created branch.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'manager_id' => 'nullable|string|exists:users,id',
        ]);

        $branch = Branch::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'manager_id' => $request->manager_id,
            'is_active' => true,
        ]);

        return response()->json($branch->load('manager'), 201);
    }

    /**
     * Display the specified branch.
     */
    public function show(Branch $branch): JsonResponse
    {
        return response()->json($branch->load('manager'));
    }

    /**
     * Update the specified branch.
     */
    public function update(Request $request, Branch $branch): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'manager_id' => 'nullable|string|exists:users,id',
            'is_active' => 'sometimes|boolean',
        ]);

        $branch->update($request->only([
            'name', 'address', 'phone', 'email', 'manager_id', 'is_active'
        ]));

        return response()->json($branch->load('manager'));
    }

    /**
     * Remove the specified branch.
     */
    public function destroy(Branch $branch): JsonResponse
    {
        $branch->update(['is_active' => false]);
        
        return response()->json(['message' => 'Branch deactivated successfully']);
    }
}
