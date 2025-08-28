<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassRoom extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'classes';

    protected $fillable = [
        'id',
        'name',
        'course_id',
        'batch_id',
        'branch_id',
        'faculty_id',
        'class_date',
        'start_time',
        'end_time',
        'topic',
        'description',
        'status',
        'notes',
    ];

    protected $casts = [
        'class_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    /**
     * Get the course for this class.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the batch for this class.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the branch where this class is held.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the faculty member teaching this class.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(User::class, 'faculty_id');
    }

    /**
     * Check if class is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if class is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if class is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
