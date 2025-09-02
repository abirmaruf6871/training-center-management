<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class QuizAttempt extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'quiz_id',
        'student_id',
        'score',
        'total_score',
        'percentage',
        'time_taken',
        'status',
        'started_at',
        'completed_at',
        'is_passed',
        'answers',
        'feedback'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_passed' => 'boolean',
        'answers' => 'array',
        'score' => 'float',
        'total_score' => 'float',
        'percentage' => 'float',
        'time_taken' => 'integer',
    ];

    // Status constants
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_ABANDONED = 'abandoned';
    const STATUS_TIMED_OUT = 'timed_out';

    // Relationships
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopePassed($query)
    {
        return $query->where('is_passed', true);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByQuiz($query, $quizId)
    {
        return $query->where('quiz_id', $quizId);
    }

    // Accessors
    public function getTimeTakenFormattedAttribute(): string
    {
        $minutes = floor($this->time_taken / 60);
        $seconds = $this->time_taken % 60;
        
        if ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }
        
        return "{$seconds}s";
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_ABANDONED => 'Abandoned',
            self::STATUS_TIMED_OUT => 'Timed Out',
            default => 'Unknown'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_IN_PROGRESS => 'blue',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_ABANDONED => 'red',
            self::STATUS_TIMED_OUT => 'orange',
            default => 'gray'
        };
    }

    public function getGradeAttribute(): string
    {
        if ($this->percentage >= 90) return 'A+';
        if ($this->percentage >= 80) return 'A';
        if ($this->percentage >= 70) return 'B';
        if ($this->percentage >= 60) return 'C';
        if ($this->percentage >= 50) return 'D';
        return 'F';
    }

    // Methods
    public function start(): void
    {
        $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);
    }

    public function complete(array $answers = []): void
    {
        $this->calculateScore($answers);
        
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'time_taken' => $this->started_at->diffInSeconds(now()),
            'answers' => $answers,
        ]);
    }

    public function abandon(): void
    {
        $this->update([
            'status' => self::STATUS_ABANDONED,
            'completed_at' => now(),
            'time_taken' => $this->started_at->diffInSeconds(now()),
        ]);
    }

    public function timeout(): void
    {
        $this->update([
            'status' => self::STATUS_TIMED_OUT,
            'completed_at' => now(),
            'time_taken' => $this->quiz->time_limit * 60, // Convert minutes to seconds
        ]);
    }

    private function calculateScore(array $answers): void
    {
        $totalScore = 0;
        $earnedScore = 0;

        foreach ($this->quiz->questions as $question) {
            $totalScore += $question->points;
            
            if (isset($answers[$question->id])) {
                $earnedScore += $question->calculateScore($answers[$question->id]);
            }
        }

        $percentage = $totalScore > 0 ? ($earnedScore / $totalScore) * 100 : 0;
        $isPassed = $percentage >= $this->quiz->passing_score;

        $this->update([
            'score' => $earnedScore,
            'total_score' => $totalScore,
            'percentage' => round($percentage, 2),
            'is_passed' => $isPassed,
        ]);
    }

    public function isExpired(): bool
    {
        if (!$this->quiz->time_limit) {
            return false;
        }

        $timeLimit = $this->started_at->addMinutes($this->quiz->time_limit);
        return now()->isAfter($timeLimit);
    }

    public function getRemainingTime(): int
    {
        if (!$this->quiz->time_limit) {
            return 0;
        }

        $timeLimit = $this->started_at->addMinutes($this->quiz->time_limit);
        $remaining = $timeLimit->diffInSeconds(now());
        
        return max(0, $remaining);
    }

    public function canBeResumed(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS && !$this->isExpired();
    }

    public function getProgressPercentage(): float
    {
        if (!$this->quiz->total_questions) {
            return 0;
        }

        $answeredQuestions = count(array_filter($this->answers ?? []));
        return round(($answeredQuestions / $this->quiz->total_questions) * 100, 1);
    }
}
