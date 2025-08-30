<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance records.
     */
    public function index(Request $request)
    {
        try {
            $query = Attendance::with(['student', 'batch']);

            // Filter by batch
            if ($request->has('batch_id') && !empty($request->batch_id)) {
                $query->where('batch_id', $request->batch_id);
            }

            // Filter by student
            if ($request->has('student_id') && !empty($request->student_id)) {
                $query->where('student_id', $request->student_id);
            }

            // Filter by date
            if ($request->has('date') && !empty($request->date)) {
                $query->where('date', $request->date);
            }

            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            $attendance = $query->orderBy('date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $attendance,
                'message' => 'Attendance records fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,id',
                'batch_id' => 'required|exists:batches,id',
                'date' => 'required|date',
                'status' => 'required|in:present,absent,late',
                'notes' => 'nullable|string',
                'marked_by' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if attendance already exists for this student, batch, and date
            $existingAttendance = Attendance::where([
                'student_id' => $request->student_id,
                'batch_id' => $request->batch_id,
                'date' => $request->date
            ])->first();

            if ($existingAttendance) {
                // Update existing record
                $existingAttendance->update([
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'marked_by' => $request->marked_by,
                    'marked_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => $existingAttendance->load(['student', 'batch']),
                    'message' => 'Attendance updated successfully'
                ]);
            }

            // Create new record
            $attendance = Attendance::create([
                'student_id' => $request->student_id,
                'batch_id' => $request->batch_id,
                'date' => $request->date,
                'status' => $request->status,
                'notes' => $request->notes,
                'marked_by' => $request->marked_by,
                'marked_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $attendance->load(['student', 'batch']),
                'message' => 'Attendance marked successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark attendance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified attendance record.
     */
    public function show($id)
    {
        try {
            $attendance = Attendance::with(['student', 'batch'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $attendance,
                'message' => 'Attendance record fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, $id)
    {
        try {
            $attendance = Attendance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|required|in:present,absent,late',
                'notes' => 'nullable|string',
                'marked_by' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $attendance->update([
                'status' => $request->status ?? $attendance->status,
                'notes' => $request->notes ?? $attendance->notes,
                'marked_by' => $request->marked_by ?? $attendance->marked_by,
                'marked_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $attendance->load(['student', 'batch']),
                'message' => 'Attendance record updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified attendance record.
     */
    public function destroy($id)
    {
        try {
            $attendance = Attendance::findOrFail($id);
            $attendance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark attendance for multiple students in a batch.
     */
    public function markBatchAttendance(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'batch_id' => 'required|exists:batches,id',
                'date' => 'required|date',
                'attendance_data' => 'required|array',
                'attendance_data.*.student_id' => 'required|exists:students,id',
                'attendance_data.*.status' => 'required|in:present,absent,late',
                'attendance_data.*.notes' => 'nullable|string',
                'general_notes' => 'nullable|string',
                'marked_by' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                $batchId = $request->batch_id;
                $date = $request->date;
                $markedBy = $request->marked_by ?? 'system';

                foreach ($request->attendance_data as $data) {
                    // Check if attendance already exists
                    $existingAttendance = Attendance::where([
                        'student_id' => $data['student_id'],
                        'batch_id' => $batchId,
                        'date' => $date
                    ])->first();

                    if ($existingAttendance) {
                        // Update existing record
                        $existingAttendance->update([
                            'status' => $data['status'],
                            'notes' => $data['notes'] ?? $existingAttendance->notes,
                            'marked_by' => $markedBy,
                            'marked_at' => now()
                        ]);
                    } else {
                        // Create new record
                        Attendance::create([
                            'student_id' => $data['student_id'],
                            'batch_id' => $batchId,
                            'date' => $date,
                            'status' => $data['status'],
                            'notes' => $data['notes'],
                            'marked_by' => $markedBy,
                            'marked_at' => now()
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Batch attendance marked successfully'
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark batch attendance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance statistics for a batch.
     */
    public function batchStatistics($batchId, Request $request)
    {
        try {
            $batch = Batch::findOrFail($batchId);
            $date = $request->get('date', now()->toDateString());

            $stats = [
                'total_students' => $batch->students()->count(),
                'present_count' => $batch->attendance()->where('date', $date)->where('status', 'present')->count(),
                'absent_count' => $batch->attendance()->where('date', $date)->where('status', 'absent')->count(),
                'late_count' => $batch->attendance()->where('date', $date)->where('status', 'late')->count(),
                'attendance_rate' => 0,
                'date' => $date
            ];

            if ($stats['total_students'] > 0) {
                $totalMarked = $stats['present_count'] + $stats['absent_count'] + $stats['late_count'];
                if ($totalMarked > 0) {
                    $stats['attendance_rate'] = round(($stats['present_count'] / $totalMarked) * 100, 1);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Attendance statistics fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

