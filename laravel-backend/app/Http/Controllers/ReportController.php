<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Income;
use App\Models\Expense;
use App\Models\Student;
use App\Models\Course;
use App\Models\Batch;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Daily Cashbook Report
     */
    public function dailyCashbook(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'branch_id' => 'nullable|uuid|exists:branches,id'
        ]);

        $date = $request->date;
        $branchId = $request->branch_id;

        // Get incomes for the date
        $incomesQuery = Income::whereDate('income_date', $date);
        if ($branchId) {
            $incomesQuery->where('branch_id', $branchId);
        }
        $incomes = $incomesQuery->get();

        // Get expenses for the date
        $expensesQuery = Expense::whereDate('expense_date', $date);
        if ($branchId) {
            $expensesQuery->where('branch_id', $branchId);
        }
        $expenses = $expensesQuery->get();

        // Calculate totals
        $totalIncome = $incomes->sum('amount');
        $totalExpense = $expenses->sum('amount');
        $netCash = $totalIncome - $totalExpense;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'branch_id' => $branchId,
                'summary' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'net_cash' => $netCash
                ],
                'incomes' => $incomes,
                'expenses' => $expenses
            ]
        ]);
    }

    /**
     * Income vs Expense Statement
     */
    public function incomeVsExpense(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'branch_id' => 'nullable|uuid|exists:branches,id'
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $branchId = $request->branch_id;

        // Get incomes
        $incomesQuery = Income::whereBetween('income_date', [$startDate, $endDate]);
        if ($branchId) {
            $incomesQuery->where('branch_id', $branchId);
        }
        $incomes = $incomesQuery->get();

        // Get expenses
        $expensesQuery = Expense::whereBetween('expense_date', [$startDate, $endDate]);
        if ($branchId) {
            $expensesQuery->where('branch_id', $branchId);
        }
        $expenses = $expensesQuery->get();

        // Group by date for trend analysis
        $incomeByDate = $incomes->groupBy('income_date')->map(function ($items) {
            return $items->sum('amount');
        });

        $expenseByDate = $expenses->groupBy('expense_date')->map(function ($items) {
            return $items->sum('amount');
        });

        // Calculate totals
        $totalIncome = $incomes->sum('amount');
        $totalExpense = $expenses->sum('amount');
        $profitLoss = $totalIncome - $totalExpense;

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'branch_id' => $branchId,
                'summary' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'profit_loss' => $profitLoss,
                    'profit_margin' => $totalIncome > 0 ? round(($profitLoss / $totalIncome) * 100, 2) : 0
                ],
                'trends' => [
                    'income_by_date' => $incomeByDate,
                    'expense_by_date' => $expenseByDate
                ],
                'incomes' => $incomes,
                'expenses' => $expenses
            ]
        ]);
    }

    /**
     * Profit/Loss Report (Overall + Branch-wise + Course-wise)
     */
    public function profitLoss(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'group_by' => 'nullable|in:overall,branch,course'
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $groupBy = $request->group_by ?? 'overall';

        if ($groupBy === 'overall') {
            return $this->getOverallProfitLoss($startDate, $endDate);
        } elseif ($groupBy === 'branch') {
            return $this->getBranchWiseProfitLoss($startDate, $endDate);
        } elseif ($groupBy === 'course') {
            return $this->getCourseWiseProfitLoss($startDate, $endDate);
        }
    }

    /**
     * Course-wise Enrollment Trend
     */
    public function enrollmentTrend(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'branch_id' => 'nullable|uuid|exists:branches,id'
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $branchId = $request->branch_id;

        // Get enrollment data grouped by month and course
        $enrollments = DB::table('students')
            ->join('courses', 'students.course_id', '=', 'courses.id')
            ->select(
                'courses.name as course_name',
                DB::raw('DATE_FORMAT(students.created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as enrollment_count')
            )
            ->whereBetween('students.created_at', [$startDate, $endDate])
            ->when($branchId, function ($query) use ($branchId) {
                return $query->where('students.branch_id', $branchId);
            })
            ->groupBy('courses.name', 'month')
            ->orderBy('month')
            ->get();

        // Group by course for trend analysis
        $trends = $enrollments->groupBy('course_name')->map(function ($items) {
            return $items->keyBy('month')->map(function ($item) {
                return $item->enrollment_count;
            });
        });

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'branch_id' => $branchId,
                'trends' => $trends,
                'raw_data' => $enrollments
            ]
        ]);
    }

    /**
     * Batch Attendance Report
     */
    public function batchAttendance(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|uuid|exists:batches,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $batchId = $request->batch_id;
        $startDate = $request->start_date;
        $endDate = $request->end_date;

        // Get batch details
        $batch = Batch::with(['students', 'course'])->find($batchId);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        // Get attendance data
        $attendance = DB::table('attendance')
            ->join('students', 'attendance.student_id', '=', 'students.id')
            ->select(
                'students.first_name',
                'students.last_name',
                'attendance.date',
                'attendance.status',
                DB::raw('COUNT(*) as total_classes'),
                DB::raw('SUM(CASE WHEN attendance.status = "present" THEN 1 ELSE 0 END) as present_count'),
                DB::raw('SUM(CASE WHEN attendance.status = "absent" THEN 1 ELSE 0 END) as absent_count'),
                DB::raw('SUM(CASE WHEN attendance.status = "late" THEN 1 ELSE 0 END) as late_count')
            )
            ->where('attendance.batch_id', $batchId)
            ->whereBetween('attendance.date', [$startDate, $endDate])
            ->groupBy('students.id', 'students.first_name', 'students.last_name')
            ->get();

        // Calculate attendance percentages
        $attendanceWithPercentage = $attendance->map(function ($item) {
            $total = $item->total_classes;
            $present = $item->present_count;
            $attendancePercentage = $total > 0 ? round(($present / $total) * 100, 2) : 0;

            return [
                'student_name' => $item->first_name . ' ' . $item->last_name,
                'total_classes' => $total,
                'present_count' => $present,
                'absent_count' => $item->absent_count,
                'late_count' => $item->late_count,
                'attendance_percentage' => $attendancePercentage
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'batch' => [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'course' => $batch->course->name
                ],
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'attendance_summary' => $attendanceWithPercentage,
                'overall_stats' => [
                    'total_students' => $batch->students->count(),
                    'average_attendance' => $attendanceWithPercentage->avg('attendance_percentage')
                ]
            ]
        ]);
    }

    /**
     * Outstanding Dues Report
     */
    public function outstandingDues(Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|uuid|exists:branches,id',
            'batch_id' => 'nullable|uuid|exists:batches,id'
        ]);

        $branchId = $request->branch_id;
        $batchId = $request->batch_id;

        // Get students with outstanding dues
        $studentsQuery = Student::with(['course', 'batch', 'branch'])
            ->where('outstanding_dues', '>', 0);

        if ($branchId) {
            $studentsQuery->where('branch_id', $branchId);
        }

        if ($batchId) {
            $studentsQuery->where('batch_id', $batchId);
        }

        $students = $studentsQuery->get();

        // Group by batch for batch-wise report
        $batchWiseDues = $students->groupBy('batch_id')->map(function ($batchStudents) {
            return [
                'batch_name' => $batchStudents->first()->batch->name ?? 'N/A',
                'total_students' => $batchStudents->count(),
                'total_dues' => $batchStudents->sum('outstanding_dues'),
                'students' => $batchStudents->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->first_name . ' ' . $student->last_name,
                        'course' => $student->course->name ?? 'N/A',
                        'outstanding_dues' => $student->outstanding_dues,
                        'phone' => $student->phone,
                        'email' => $student->email
                    ];
                })
            ];
        });

        $totalOutstandingDues = $students->sum('outstanding_dues');

        return response()->json([
            'success' => true,
            'data' => [
                'filters' => [
                    'branch_id' => $branchId,
                    'batch_id' => $batchId
                ],
                'summary' => [
                    'total_students_with_dues' => $students->count(),
                    'total_outstanding_amount' => $totalOutstandingDues
                ],
                'batch_wise_dues' => $batchWiseDues,
                'student_wise_dues' => $students->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->first_name . ' ' . $student->last_name,
                        'course' => $student->course->name ?? 'N/A',
                        'batch' => $student->batch->name ?? 'N/A',
                        'branch' => $student->branch->name ?? 'N/A',
                        'outstanding_dues' => $student->outstanding_dues,
                        'phone' => $student->phone,
                        'email' => $student->email
                    ];
                })
            ]
        ]);
    }

    /**
     * Get Overall Profit/Loss
     */
    private function getOverallProfitLoss($startDate, $endDate)
    {
        $totalIncome = Income::whereBetween('income_date', [$startDate, $endDate])->sum('amount');
        $totalExpense = Expense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');
        $profitLoss = $totalIncome - $totalExpense;

        return response()->json([
            'success' => true,
            'data' => [
                'type' => 'overall',
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'summary' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'profit_loss' => $profitLoss,
                    'profit_margin' => $totalIncome > 0 ? round(($profitLoss / $totalIncome) * 100, 2) : 0
                ]
            ]
        ]);
    }

    /**
     * Get Branch-wise Profit/Loss
     */
    private function getBranchWiseProfitLoss($startDate, $endDate)
    {
        $branches = Branch::with(['incomes', 'expenses'])->get();

        $branchWiseData = $branches->map(function ($branch) use ($startDate, $endDate) {
            $income = $branch->incomes()
                ->whereBetween('income_date', [$startDate, $endDate])
                ->sum('amount');

            $expense = $branch->expenses()
                ->whereBetween('expense_date', [$startDate, $endDate])
                ->sum('amount');

            $profitLoss = $income - $expense;

            return [
                'branch_id' => $branch->id,
                'branch_name' => $branch->name,
                'branch_code' => $branch->code,
                'income' => $income,
                'expense' => $expense,
                'profit_loss' => $profitLoss,
                'profit_margin' => $income > 0 ? round(($profitLoss / $income) * 100, 2) : 0
            ];
        });

        $totalIncome = $branchWiseData->sum('income');
        $totalExpense = $branchWiseData->sum('expense');
        $totalProfitLoss = $totalIncome - $totalExpense;

        return response()->json([
            'success' => true,
            'data' => [
                'type' => 'branch_wise',
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'summary' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'total_profit_loss' => $totalProfitLoss,
                    'total_profit_margin' => $totalIncome > 0 ? round(($totalProfitLoss / $totalIncome) * 100, 2) : 0
                ],
                'branches' => $branchWiseData
            ]
        ]);
    }

    /**
     * Get Course-wise Profit/Loss
     */
    private function getCourseWiseProfitLoss($startDate, $endDate)
    {
        // This would need to be implemented based on how course revenue and costs are tracked
        // For now, returning a placeholder structure
        return response()->json([
            'success' => true,
            'data' => [
                'type' => 'course_wise',
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'message' => 'Course-wise profit/loss calculation requires additional data structure for course costs and revenue allocation',
                'summary' => [
                    'total_income' => 0,
                    'total_expense' => 0,
                    'total_profit_loss' => 0
                ],
                'courses' => []
            ]
        ]);
    }
}


