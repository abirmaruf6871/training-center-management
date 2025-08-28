<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'description',
        'duration',
        'total_fee',
        'admission_fee',
        'installment_count',
        'batch_size_limit',
        'branch_id',
        'discount_percentage',
        'is_active',
    ];

    protected $casts = [
        'duration' => 'integer',
        'total_fee' => 'decimal:2',
        'admission_fee' => 'decimal:2',
        'installment_count' => 'integer',
        'batch_size_limit' => 'integer',
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the branch that offers this course.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the students enrolled in this course.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the batches for this course.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    /**
     * Get the classes for this course.
     */
    public function classes(): HasMany
    {
        return $this->hasMany(ClassRoom::class);
    }

    /**
     * Get the payments for this course.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
