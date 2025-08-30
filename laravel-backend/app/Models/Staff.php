<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Staff extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'branch_id',
        'user_id',
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'position',
        'department',
        'hire_date',
        'salary',
        'employment_type',
        'status',
        'metadata'
    ];

    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'metadata' => 'array'
    ];

    // Relationships
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeByEmploymentType($query, $type)
    {
        return $query->where('employment_type', $type);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getFormattedSalaryAttribute()
    {
        if (!$this->salary) return 'N/A';
        return '৳' . number_format($this->salary, 2);
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'active' => 'bg-green-100 text-green-800',
            'inactive' => 'bg-gray-100 text-gray-800',
            'terminated' => 'bg-red-100 text-red-800'
        ];
        
        return $badges[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    public function getEmploymentTypeLabelAttribute()
    {
        $types = [
            'full-time' => 'Full Time',
            'part-time' => 'Part Time',
            'contract' => 'Contract'
        ];
        
        return $types[$this->employment_type] ?? $this->employment_type;
    }

    public function getPositionLabelAttribute()
    {
        $positions = [
            'manager' => 'Manager',
            'teacher' => 'Teacher',
            'accountant' => 'Accountant',
            'receptionist' => 'Receptionist',
            'maintenance' => 'Maintenance',
            'other' => 'Other'
        ];
        
        return $positions[$this->position] ?? $this->position;
    }

    // Methods
    public function activate()
    {
        $this->update(['status' => 'active']);
    }

    public function deactivate()
    {
        $this->update(['status' => 'inactive']);
    }

    public function terminate()
    {
        $this->update(['status' => 'terminated']);
    }

    public function updateSalary($newSalary)
    {
        $this->update(['salary' => $newSalary]);
    }
}
