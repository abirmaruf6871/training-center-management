<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'address',
        'phone',
        'email',
        'manager_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the manager of this branch.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the users that belong to this branch.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the courses offered at this branch.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Get the students enrolled at this branch.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the classes held at this branch.
     */
    public function classes(): HasMany
    {
        return $this->hasMany(ClassRoom::class);
    }

    /**
     * Get the expenses for this branch.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get the batches at this branch.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }
}
