<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'bmdc_no',
        'date_of_birth',
        'gender',
        'address',
        'course_id',
        'branch_id',
        'batch_id',
        'admission_date',
        'total_fee',
        'admission_fee',
        'discount_amount',
        'final_fee',
        'payment_status',
        'status',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'admission_date' => 'date',
        'total_fee' => 'decimal:2',
        'admission_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_fee' => 'decimal:2',
    ];

    /**
     * Get the course the student is enrolled in.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the branch where the student is enrolled.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the batch the student belongs to.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the payments made by this student.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the student's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if student has completed payment.
     */
    public function hasCompletedPayment(): bool
    {
        return $this->payment_status === 'completed';
    }

    /**
     * Check if student is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
