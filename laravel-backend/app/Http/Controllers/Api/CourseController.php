<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $courses = Course::with('branch')->get();
            return response()->json($courses);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch courses'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'duration' => 'required|integer|min:1',
                'totalFee' => 'required|numeric|min:0',
                'admissionFee' => 'required|numeric|min:0',
                'installmentCount' => 'required|integer|min:1',
                'batchSizeLimit' => 'required|integer|min:1',
                'branchId' => 'required|string|exists:branches,id',
                'discountPercentage' => 'nullable|numeric|min:0|max:100',
                'isActive' => 'nullable|boolean',
            ]);

            $course = Course::create([
                'id' => Str::uuid(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'duration' => $validated['duration'],
                'total_fee' => $validated['totalFee'],
                'admission_fee' => $validated['admissionFee'],
                'installment_count' => $validated['installmentCount'],
                'batch_size_limit' => $validated['batchSizeLimit'],
                'branch_id' => $validated['branchId'],
                'discount_percentage' => $validated['discountPercentage'] ?? 0,
                'is_active' => $validated['isActive'] ?? true,
            ]);

            return response()->json($course->load('branch'), 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create course'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $course = Course::with('branch')->findOrFail($id);
            return response()->json($course);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Course not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'duration' => 'required|integer|min:1',
                'totalFee' => 'required|numeric|min:0',
                'admissionFee' => 'required|numeric|min:0',
                'installmentCount' => 'required|integer|min:1',
                'batchSizeLimit' => 'required|integer|min:1',
                'branchId' => 'required|string|exists:branches,id',
                'discountPercentage' => 'nullable|numeric|min:0|max:100',
                'isActive' => 'nullable|boolean',
            ]);

            $course = Course::findOrFail($id);
            $course->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'duration' => $validated['duration'],
                'total_fee' => $validated['totalFee'],
                'admission_fee' => $validated['admissionFee'],
                'installment_count' => $validated['installmentCount'],
                'batch_size_limit' => $validated['batchSizeLimit'],
                'branch_id' => $validated['branchId'],
                'discount_percentage' => $validated['discountPercentage'] ?? 0,
                'is_active' => $validated['isActive'] ?? $course->is_active,
            ]);

            return response()->json($course->load('branch'));
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update course'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $course = Course::findOrFail($id);
            $course->delete();
            return response()->json(['message' => 'Course deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete course'], 500);
        }
    }
}
