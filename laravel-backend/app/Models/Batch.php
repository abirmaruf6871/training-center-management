<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batch extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'course_id',
        'branch_id',
        'start_date',
        'end_date',
        'max_students',
        'current_students',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'max_students' => 'integer',
        'current_students' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the course for this batch.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the branch for this batch.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the students in this batch.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the classes for this batch.
     */
    public function classes(): HasMany
    {
        return $this->hasMany(ClassRoom::class);
    }

    /**
     * Check if batch is full.
     */
    public function isFull(): bool
    {
        return $this->current_students >= $this->max_students;
    }

    /**
     * Check if batch is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get available seats in batch.
     */
    public function getAvailableSeatsAttribute(): int
    {
        return $this->max_students - $this->current_students;
    }
}
