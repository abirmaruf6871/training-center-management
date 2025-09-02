<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Quiz extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'description',
        'category',
        'difficulty',
        'time_limit',
        'passing_score',
        'total_questions',
        'is_active',
        'start_date',
        'end_date',
        'created_by',
        'is_randomized',
        'show_answers_after',
        'allow_retake',
        'max_attempts'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'is_randomized' => 'boolean',
        'show_answers_after' => 'boolean',
        'allow_retake' => 'boolean',
        'time_limit' => 'integer',
        'passing_score' => 'integer',
        'total_questions' => 'integer',
        'max_attempts' => 'integer',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('category', 'like', "%{$search}%");
        });
    }

    public function scopeAvailable($query)
    {
        $now = now();
        return $query->where('is_active', true)
                    ->where(function ($q) use ($now) {
                        $q->whereNull('start_date')
                          ->orWhere('start_date', '<=', $now);
                    })
                    ->where(function ($q) use ($now) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', $now);
                    });
    }

    // Accessors
    public function getIsAvailableAttribute(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        
        if ($this->start_date && $now < $this->start_date) {
            return false;
        }

        if ($this->end_date && $now > $this->end_date) {
            return false;
        }

        return true;
    }

    public function getAttemptsCountAttribute(): int
    {
        return $this->attempts()->count();
    }

    public function getAverageScoreAttribute(): float
    {
        $completedAttempts = $this->attempts()->where('status', 'completed');
        if ($completedAttempts->count() === 0) {
            return 0;
        }

        return round($completedAttempts->avg('percentage'), 1);
    }

    public function getTotalQuestionsAttribute(): int
    {
        return $this->questions()->count();
    }

    // Methods
    public function canBeAttemptedBy($user): bool
    {
        if (!$this->is_available) {
            return false;
        }

        if ($this->max_attempts) {
            $userAttempts = $this->attempts()->where('student_id', $user->id)->count();
            if ($userAttempts >= $this->max_attempts) {
                return false;
            }
        }

        return true;
    }

    public function getNextQuestionOrder(): int
    {
        $lastQuestion = $this->questions()->orderBy('order', 'desc')->first();
        return $lastQuestion ? $lastQuestion->order + 1 : 1;
    }
}
