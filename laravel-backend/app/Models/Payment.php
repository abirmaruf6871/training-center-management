<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'student_id',
        'course_id',
        'installment_number',
        'amount',
        'due_date',
        'payment_date',
        'payment_method',
        'status',
        'collected_by',
        'notes',
    ];

    protected $casts = [
        'installment_number' => 'integer',
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
    ];

    /**
     * Get the student who made this payment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the course for this payment.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the user who collected this payment.
     */
    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Check if payment is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'pending' && $this->due_date->isPast();
    }

    /**
     * Check if payment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'paid';
    }
}
