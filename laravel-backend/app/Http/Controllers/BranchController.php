<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Income;
use App\Models\Expense;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Batch;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    /**
     * Display a listing of branches with summary data
     */
    public function index(Request $request)
    {
        try {
            $query = Branch::withCount(['students', 'staff', 'batches', 'courses']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('is_active', $request->status === 'active');
            }

            // Filter by location
            if ($request->has('location') && $request->location !== 'all') {
                $query->where('location', $request->location);
            }

            // Search by name or code
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            }

            $branches = $query->orderBy('name')->paginate(15);

            // Add financial summary for each branch
            $branches->getCollection()->transform(function ($branch) {
                $branch->total_income = $branch->getTotalIncome();
                $branch->total_expenses = $branch->getTotalExpenses();
                $branch->profit_loss = $branch->getProfitLoss();
                $branch->outstanding_dues = $branch->getOutstandingDues();
                $branch->active_batches = $branch->getActiveBatchesCount();
                $branch->completed_batches = $branch->getCompletedBatchesCount();
                return $branch;
            });

            return response()->json([
                'success' => true,
                'data' => $branches
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch branches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created branch
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:branches',
                'location' => 'required|string|max:255',
                'address' => 'nullable|string',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'website' => 'nullable|url|max:255',
                'manager_name' => 'nullable|string|max:255',
                'manager_phone' => 'nullable|string|max:20',
                'manager_email' => 'nullable|email|max:255',
                'opening_date' => 'nullable|date',
                'timezone' => 'nullable|string|max:50',
                'currency' => 'nullable|string|max:10',
                'tax_rate' => 'nullable|numeric|min:0|max:100',
                'capacity' => 'nullable|integer|min:0',
                'max_students' => 'nullable|integer|min:0',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $branch = Branch::create($request->all());

            // Generate default settings
            $defaultSettings = [
                'permissions' => [
                    'can_manage_students' => true,
                    'can_manage_courses' => true,
                    'can_manage_batches' => true,
                    'can_view_reports' => true,
                    'can_manage_staff' => false,
                    'can_manage_finances' => false
                ],
                'dashboard' => [
                    'show_financial_summary' => true,
                    'show_student_stats' => true,
                    'show_batch_progress' => true
                ],
                'reporting' => [
                    'monthly_reports' => true,
                    'quarterly_reports' => true,
                    'annual_reports' => true
                ]
            ];

            $branch->update(['settings' => $defaultSettings]);

            return response()->json([
                'success' => true,
                'message' => 'Branch created successfully',
                'data' => $branch
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified branch with detailed information
     */
    public function show($id)
    {
        try {
            $branch = Branch::with([
                'students',
                'staff',
                'batches',
                'courses',
                'faculties'
            ])->findOrFail($id);

            // Add financial summary
            $branch->total_income = $branch->getTotalIncome();
            $branch->total_expenses = $branch->getTotalExpenses();
            $branch->profit_loss = $branch->getProfitLoss();
            $branch->outstanding_dues = $branch->getOutstandingDues();
            $branch->active_batches = $branch->getActiveBatchesCount();
            $branch->completed_batches = $branch->getCompletedBatchesCount();

            // Recent activities
            $branch->recent_incomes = Income::where('branch_id', $id)
                ->orderBy('date', 'desc')
                ->limit(5)
                ->get();

            $branch->recent_expenses = Expense::where('branch_id', $id)
                ->orderBy('date', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $branch
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified branch
     */
    public function update(Request $request, $id)
    {
        try {
            $branch = Branch::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'code' => 'sometimes|required|string|max:50|unique:branches,code,' . $id,
                'location' => 'sometimes|required|string|max:255',
                'address' => 'nullable|string',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'website' => 'nullable|url|max:255',
                'manager_name' => 'nullable|string|max:255',
                'manager_phone' => 'nullable|string|max:20',
                'manager_email' => 'nullable|email|max:255',
                'opening_date' => 'nullable|date',
                'timezone' => 'nullable|string|max:50',
                'currency' => 'nullable|string|max:10',
                'tax_rate' => 'nullable|numeric|min:0|max:100',
                'capacity' => 'nullable|integer|min:0',
                'max_students' => 'nullable|integer|min:0',
                'description' => 'nullable|string',
                'is_active' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $branch->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Branch updated successfully',
                'data' => $branch
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified branch
     */
    public function destroy($id)
    {
        try {
            $branch = Branch::findOrFail($id);

            // Check if branch has any related data
            $hasStudents = $branch->students()->exists();
            $hasStaff = $branch->staff()->exists();
            $hasBatches = $branch->batches()->exists();

            if ($hasStudents || $hasStaff || $hasBatches) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete branch. It has related students, staff, or batches.'
                ], 422);
            }

            $branch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Branch deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete branch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get branch financial report
     */
    public function financialReport(Request $request, $id)
    {
        try {
            $branch = Branch::findOrFail($id);
            
            $startDate = $request->get('start_date', now()->startOfMonth());
            $endDate = $request->get('end_date', now()->endOfMonth());

            $report = [
                'branch' => $branch->only(['id', 'name', 'code', 'location']),
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'summary' => [
                    'total_income' => $branch->getTotalIncome($startDate, $endDate),
                    'total_expenses' => $branch->getTotalExpenses($startDate, $endDate),
                    'profit_loss' => $branch->getProfitLoss($startDate, $endDate),
                    'student_admissions' => $branch->getStudentAdmissionCount($startDate, $endDate),
                    'outstanding_dues' => $branch->getOutstandingDues()
                ],
                'income_by_category' => Income::where('branch_id', $id)
                    ->whereBetween('date', [$startDate, $endDate])
                    ->select('category', DB::raw('SUM(amount) as total'))
                    ->groupBy('category')
                    ->get(),
                'expenses_by_category' => Expense::where('branch_id', $id)
                    ->whereBetween('date', [$startDate, $endDate])
                    ->select('category', DB::raw('SUM(amount) as total'))
                    ->groupBy('category')
                    ->get(),
                'monthly_trends' => $this->getMonthlyTrends($id, $startDate, $endDate)
            ];

            return response()->json([
                'success' => true,
                'data' => $report
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate financial report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get consolidated report for all branches
     */
    public function consolidatedReport(Request $request)
    {
        try {
            $startDate = $request->get('start_date', now()->startOfMonth());
            $endDate = $request->get('end_date', now()->endOfMonth());

            $branches = Branch::active()->get();

            $consolidated = [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'summary' => [
                    'total_branches' => $branches->count(),
                    'total_income' => 0,
                    'total_expenses' => 0,
                    'total_profit_loss' => 0,
                    'total_students' => 0,
                    'total_staff' => 0,
                    'total_batches' => 0
                ],
                'branch_comparison' => [],
                'top_performers' => []
            ];

            foreach ($branches as $branch) {
                $income = $branch->getTotalIncome($startDate, $endDate);
                $expenses = $branch->getTotalExpenses($startDate, $endDate);
                $profitLoss = $income - $expenses;

                $consolidated['summary']['total_income'] += $income;
                $consolidated['summary']['total_expenses'] += $expenses;
                $consolidated['summary']['total_profit_loss'] += $profitLoss;
                $consolidated['summary']['total_students'] += $branch->students()->count();
                $consolidated['summary']['total_staff'] += $branch->staff()->count();
                $consolidated['summary']['total_batches'] += $branch->batches()->count();

                $consolidated['branch_comparison'][] = [
                    'branch' => $branch->only(['id', 'name', 'code', 'location']),
                    'income' => $income,
                    'expenses' => $expenses,
                    'profit_loss' => $profitLoss,
                    'students' => $branch->students()->count(),
                    'staff' => $branch->staff()->count(),
                    'batches' => $branch->batches()->count()
                ];
            }

            // Sort by profit/loss for top performers
            usort($consolidated['branch_comparison'], function($a, $b) {
                return $b['profit_loss'] <=> $a['profit_loss'];
            });

            $consolidated['top_performers'] = array_slice($consolidated['branch_comparison'], 0, 5);

            return response()->json([
                'success' => true,
                'data' => $consolidated
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate consolidated report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly trends for a branch
     */
    private function getMonthlyTrends($branchId, $startDate, $endDate)
    {
        $months = [];
        $current = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        while ($current <= $end) {
            $monthStart = $current->copy()->startOfMonth();
            $monthEnd = $current->copy()->endOfMonth();

            $income = Income::where('branch_id', $branchId)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('amount');

            $expenses = Expense::where('branch_id', $branchId)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('amount');

            $months[] = [
                'month' => $current->format('Y-m'),
                'income' => $income,
                'expenses' => $expenses,
                'profit_loss' => $income - $expenses
            ];

            $current->addMonth();
        }

        return $months;
    }

    /**
     * Get branch statistics
     */
    public function statistics($id)
    {
        try {
            $branch = Branch::findOrFail($id);

            $stats = [
                'students' => [
                    'total' => $branch->students()->count(),
                    'active' => $branch->students()->where('status', 'active')->count(),
                    'inactive' => $branch->students()->where('status', 'inactive')->count(),
                    'new_this_month' => $branch->students()
                        ->whereMonth('created_at', now()->month)
                        ->count()
                ],
                'batches' => [
                    'total' => $branch->batches()->count(),
                    'active' => $branch->batches()->where('status', 'active')->count(),
                    'upcoming' => $branch->batches()->where('status', 'upcoming')->count(),
                    'completed' => $branch->batches()->where('status', 'completed')->count()
                ],
                'staff' => [
                    'total' => $branch->staff()->count(),
                    'active' => $branch->staff()->where('status', 'active')->count(),
                    'by_department' => $branch->staff()
                        ->select('department', DB::raw('count(*) as count'))
                        ->groupBy('department')
                        ->get()
                ],
                'courses' => [
                    'total' => $branch->courses()->count(),
                    'active' => $branch->courses()->where('is_active', true)->count()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle branch status
     */
    public function toggleStatus($id)
    {
        try {
            $branch = Branch::findOrFail($id);
            $branch->update(['is_active' => !$branch->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'Branch status updated successfully',
                'data' => [
                    'id' => $branch->id,
                    'is_active' => $branch->is_active
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update branch status: ' . $e->getMessage()
            ], 500);
        }
    }
}


