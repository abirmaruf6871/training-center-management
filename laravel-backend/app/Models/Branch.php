<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Branch extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'name',
        'code',
        'location',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'website',
        'manager_name',
        'manager_phone',
        'manager_email',
        'opening_date',
        'is_active',
        'timezone',
        'currency',
        'tax_rate',
        'settings',
        'logo_path',
        'banner_path',
        'description',
        'capacity',
        'current_students',
        'max_students'
    ];

    protected $casts = [
        'opening_date' => 'date',
        'is_active' => 'boolean',
        'settings' => 'array',
        'tax_rate' => 'decimal:2',
        'capacity' => 'integer',
        'current_students' => 'integer',
        'max_students' => 'integer'
    ];

    // Relationships
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function faculties()
    {
        return $this->hasMany(Faculty::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function incomes()
    {
        return $this->hasMany(Income::class);
    }

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    // Accessors
    public function getFullAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->country
        ]);
        
        return implode(', ', $parts);
    }

    public function getStatusBadgeAttribute()
    {
        return $this->is_active ? 'Active' : 'Inactive';
    }

    public function getStudentCapacityPercentageAttribute()
    {
        if ($this->max_students <= 0) return 0;
        return round(($this->current_students / $this->max_students) * 100, 2);
    }

    // Methods for financial calculations
    public function getTotalIncome($startDate = null, $endDate = null)
    {
        $query = $this->incomes()->where('status', 'received');
        
        if ($startDate) {
            $query->where('income_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('income_date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    public function getTotalExpenses($startDate = null, $endDate = null)
    {
        $query = $this->expenses()->where('status', 'paid');
        
        if ($startDate) {
            $query->where('expense_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('expense_date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    public function getProfitLoss($startDate = null, $endDate = null)
    {
        $income = $this->getTotalIncome($startDate, $endDate);
        $expenses = $this->getTotalExpenses($startDate, $endDate);
        
        return $income - $expenses;
    }

    public function getStudentAdmissionCount($startDate = null, $endDate = null)
    {
        $query = $this->students();
        
        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }
        
        return $query->count();
    }

    public function getOutstandingDues()
    {
        // This would need to be implemented based on your payment structure
        return 0;
    }

    public function getStaffCount()
    {
        return $this->staff()->where('status', 'active')->count();
    }

    public function getActiveBatchesCount()
    {
        return $this->batches()->where('is_active', true)->count();
    }

    public function getCompletedBatchesCount()
    {
        return $this->batches()->where('is_active', false)->count();
    }
}
