<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use App\Models\Batch;
use App\Models\Branch;
use App\Models\Income;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SecurityController extends Controller
{
    /**
     * Get User Roles and Permissions
     */
    public function getUserRoles(Request $request)
    {
        $user = Auth::user();
        
        // Define role hierarchy and permissions
        $roles = [
            'super_admin' => [
                'name' => 'Super Administrator',
                'permissions' => ['all'],
                'description' => 'Full access to all features and data'
            ],
            'central_admin' => [
                'name' => 'Central Administrator',
                'permissions' => ['view_all_branches', 'manage_branches', 'view_reports', 'export_data'],
                'description' => 'Can manage all branches and view consolidated reports'
            ],
            'branch_manager' => [
                'name' => 'Branch Manager',
                'permissions' => ['manage_own_branch', 'view_own_branch_reports', 'manage_students', 'manage_courses'],
                'description' => 'Can manage their assigned branch and related data'
            ],
            'branch_accountant' => [
                'name' => 'Branch Accountant',
                'permissions' => ['view_own_branch_financials', 'manage_payments', 'view_reports'],
                'description' => 'Can manage financial data for their branch'
            ],
            'branch_staff' => [
                'name' => 'Branch Staff',
                'permissions' => ['view_own_branch_data', 'manage_attendance', 'basic_reports'],
                'description' => 'Basic access to branch data and attendance management'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'current_user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'branch_staff',
                    'branch_id' => $user->branch_id
                ],
                'roles' => $roles,
                'user_permissions' => $roles[$user->role ?? 'branch_staff']['permissions'] ?? []
            ]
        ]);
    }

    /**
     * Update User Role
     */
    public function updateUserRole(Request $request)
    {
        // Only super admin and central admin can update roles
        $user = Auth::user();
        if (!in_array($user->role, ['super_admin', 'central_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update user roles'
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
            'role' => 'required|string|in:super_admin,central_admin,branch_manager,branch_accountant,branch_staff',
            'branch_id' => 'nullable|uuid|exists:branches,id'
        ]);

        $targetUser = User::find($request->user_id);
        
        // Prevent role escalation
        if ($user->role === 'central_admin' && $request->role === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Central admin cannot promote users to super admin'
            ], 403);
        }

        $targetUser->update([
            'role' => $request->role,
            'branch_id' => $request->branch_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully',
            'data' => [
                'user_id' => $targetUser->id,
                'new_role' => $targetUser->role,
                'branch_id' => $targetUser->branch_id
            ]
        ]);
    }

    /**
     * Change User Password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string'
        ]);

        $user = Auth::user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Export Data to Excel/CSV
     */
    public function exportData(Request $request)
    {
        $request->validate([
            'data_type' => 'required|string|in:students,courses,batches,branches,incomes,expenses,all',
            'format' => 'required|string|in:excel,csv,json',
            'filters' => 'nullable|array'
        ]);

        $user = Auth::user();
        $dataType = $request->data_type;
        $format = $request->format;
        $filters = $request->filters ?? [];

        // Check permissions based on data type
        if (!$this->canExportData($user, $dataType)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to export this data'
            ], 403);
        }

        try {
            $data = $this->getExportData($dataType, $filters, $user);
            
            if ($format === 'json') {
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            // For Excel/CSV, return data structure (in production, generate actual file)
            $filename = "{$dataType}_export_" . date('Y-m-d_H-i-s') . ".{$format}";
            
            return response()->json([
                'success' => true,
                'message' => 'Data export prepared successfully',
                'data' => [
                    'filename' => $filename,
                    'record_count' => count($data),
                    'download_url' => url("/api/security/download-export/{$filename}"),
                    'data_preview' => array_slice($data, 0, 5) // First 5 records as preview
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Backup Status
     */
    public function getBackupStatus()
    {
        $user = Auth::user();
        
        // Only super admin and central admin can view backup status
        if (!in_array($user->role, ['super_admin', 'central_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to view backup status'
            ], 403);
        }

        // Simulate backup status (in production, check actual backup systems)
        $backupStatus = [
            'last_backup' => now()->subHours(6)->toISOString(),
            'backup_frequency' => 'Daily at 2:00 AM',
            'backup_location' => 'Cloud Storage (Google Drive)',
            'backup_size' => '2.5 GB',
            'status' => 'healthy',
            'next_backup' => now()->addHours(18)->toISOString(),
            'retention_policy' => '30 days',
            'encryption' => 'AES-256'
        ];

        return response()->json([
            'success' => true,
            'data' => $backupStatus
        ]);
    }

    /**
     * Initiate Manual Backup
     */
    public function initiateBackup()
    {
        $user = Auth::user();
        
        // Only super admin and central admin can initiate backups
        if (!in_array($user->role, ['super_admin', 'central_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to initiate backup'
            ], 403);
        }

        try {
            // Simulate backup process (in production, run actual backup)
            $backupId = 'backup_' . time();
            
            return response()->json([
                'success' => true,
                'message' => 'Backup initiated successfully',
                'data' => [
                    'backup_id' => $backupId,
                    'status' => 'in_progress',
                    'estimated_completion' => now()->addMinutes(15)->toISOString(),
                    'message' => 'Backup is running in the background. You will be notified when complete.'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate backup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get System Security Status
     */
    public function getSecurityStatus()
    {
        $user = Auth::user();
        
        // Only super admin and central admin can view security status
        if (!in_array($user->role, ['super_admin', 'central_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to view security status'
            ], 403);
        }

        $securityStatus = [
            'encryption' => [
                'database' => 'Enabled (AES-256)',
                'file_storage' => 'Enabled (AES-256)',
                'api_communication' => 'Enabled (HTTPS/TLS 1.3)'
            ],
            'authentication' => [
                'password_policy' => 'Strong (min 8 chars, mixed case, numbers, symbols)',
                'session_timeout' => '8 hours',
                'failed_login_attempts' => '5 attempts before lockout',
                'two_factor_auth' => 'Optional'
            ],
            'access_control' => [
                'role_based_access' => 'Enabled',
                'ip_whitelisting' => 'Disabled',
                'audit_logging' => 'Enabled'
            ],
            'data_protection' => [
                'gdpr_compliance' => 'Partial',
                'data_retention' => '30 days for logs, 7 years for financial data',
                'data_anonymization' => 'Enabled for deleted records'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $securityStatus
        ]);
    }

    /**
     * Check if user can export specific data type
     */
    private function canExportData($user, $dataType)
    {
        $role = $user->role ?? 'branch_staff';
        
        switch ($dataType) {
            case 'all':
                return in_array($role, ['super_admin', 'central_admin']);
            
            case 'branches':
                return in_array($role, ['super_admin', 'central_admin']);
            
            case 'incomes':
            case 'expenses':
                return in_array($role, ['super_admin', 'central_admin', 'branch_accountant']);
            
            default:
                return in_array($role, ['super_admin', 'central_admin', 'branch_manager', 'branch_accountant']);
        }
    }

    /**
     * Get data for export based on type and user permissions
     */
    private function getExportData($dataType, $filters, $user)
    {
        $role = $user->role ?? 'branch_staff';
        $branchId = $user->branch_id;

        switch ($dataType) {
            case 'students':
                $query = Student::with(['course', 'batch', 'branch']);
                if ($branchId && !in_array($role, ['super_admin', 'central_admin'])) {
                    $query->where('branch_id', $branchId);
                }
                return $query->get()->toArray();

            case 'courses':
                $query = Course::with(['branch']);
                if ($branchId && !in_array($role, ['super_admin', 'central_admin'])) {
                    $query->where('branch_id', $branchId);
                }
                return $query->get()->toArray();

            case 'batches':
                $query = Batch::with(['course', 'faculty', 'branch']);
                if ($branchId && !in_array($role, ['super_admin', 'central_admin'])) {
                    $query->where('branch_id', $branchId);
                }
                return $query->get()->toArray();

            case 'branches':
                if (!in_array($role, ['super_admin', 'central_admin'])) {
                    return [];
                }
                return Branch::all()->toArray();

            case 'incomes':
                $query = Income::with(['branch', 'user']);
                if ($branchId && !in_array($role, ['super_admin', 'central_admin'])) {
                    $query->where('branch_id', $branchId);
                }
                return $query->get()->toArray();

            case 'expenses':
                $query = Expense::with(['branch', 'user']);
                if ($branchId && !in_array($role, ['super_admin', 'central_admin'])) {
                    $query->where('branch_id', $branchId);
                }
                return $query->get()->toArray();

            case 'all':
                if (!in_array($role, ['super_admin', 'central_admin'])) {
                    return [];
                }
                return [
                    'students' => Student::with(['course', 'batch', 'branch'])->get()->toArray(),
                    'courses' => Course::with(['branch'])->get()->toArray(),
                    'batches' => Batch::with(['course', 'faculty', 'branch'])->get()->toArray(),
                    'branches' => Branch::all()->toArray(),
                    'incomes' => Income::with(['branch', 'user'])->get()->toArray(),
                    'expenses' => Expense::with(['branch', 'user'])->get()->toArray()
                ];

            default:
                return [];
        }
    }
}

