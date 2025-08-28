<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Course;
use App\Models\Branch;
use App\Models\Batch;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Student::with(['course', 'branch', 'batch']);
            
            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('bmdc_no', 'like', "%{$search}%");
                });
            }
            
            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }
            
            // Filter by course
            if ($request->has('course_id') && !empty($request->course_id)) {
                $query->where('course_id', $request->course_id);
            }
            
            // Filter by branch
            if ($request->has('branch_id') && !empty($request->branch_id)) {
                $query->where('branch_id', $request->branch_id);
            }
            
            // Filter by batch
            if ($request->has('batch_id') && !empty($request->batch_id)) {
                $query->where('batch_id', $request->batch_id);
            }
            
            $students = $query->orderBy('created_at', 'desc')->paginate(15);
            
            return response()->json([
                'success' => true,
                'data' => $students,
                'message' => 'Students retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email',
                'phone' => 'required|string|max:20',
                'bmdc_no' => 'nullable|string|max:50|unique:students,bmdc_no',
                'date_of_birth' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'address' => 'required|string',
                'course_id' => 'required|exists:courses,id',
                'branch_id' => 'required|exists:branches,id',
                'batch_id' => 'required|exists:batches,id',
                'admission_date' => 'required|date',
                'total_fee' => 'required|numeric|min:0',
                'admission_fee' => 'required|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'status' => 'required|in:active,inactive',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['final_fee'] = $data['total_fee'] - ($data['discount_amount'] ?? 0);
            $data['payment_status'] = 'pending';

            $student = Student::create($data);

            return response()->json([
                'success' => true,
                'data' => $student->load(['course', 'branch', 'batch']),
                'message' => 'Student created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $student = Student::with(['course', 'branch', 'batch'])->find($id);
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $student,
                'message' => 'Student retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $student = Student::find($id);
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => ['required', 'email', Rule::unique('students')->ignore($id)],
                'phone' => 'required|string|max:20',
                'bmdc_no' => ['nullable', 'string', 'max:50', Rule::unique('students')->ignore($id)],
                'date_of_birth' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'address' => 'required|string',
                'course_id' => 'required|exists:courses,id',
                'branch_id' => 'required|exists:branches,id',
                'batch_id' => 'required|exists:batches,id',
                'admission_date' => 'required|date',
                'total_fee' => 'required|numeric|min:0',
                'admission_fee' => 'required|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'status' => 'required|in:active,inactive',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['final_fee'] = $data['total_fee'] - ($data['discount_amount'] ?? 0);

            $student->update($data);

            return response()->json([
                'success' => true,
                'data' => $student->load(['course', 'branch', 'batch']),
                'message' => 'Student updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $student = Student::find($id);
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found'
                ], 404);
            }

            $student->delete();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
