<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Question extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'quiz_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'points',
        'order',
        'explanation',
        'is_required',
        'sub_statements'
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'points' => 'integer',
        'order' => 'integer',
        'is_required' => 'boolean',
        'sub_statements' => 'array',
    ];

    // Question types
    const TYPE_MCQ = 'mcq';
    const TYPE_MULTIPLE_ANSWER = 'multiple_answer';
    const TYPE_TRUE_FALSE = 'true_false';
    const TYPE_MULTIPLE_TRUE_FALSE = 'multiple_true_false';
    const TYPE_FILL_BLANKS = 'fill_blanks';
    const TYPE_MATCHING = 'matching';
    const TYPE_DESCRIPTIVE = 'descriptive';

    // Relationships
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('question_type', $type);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // Accessors
    public function getQuestionTypeLabelAttribute(): string
    {
        return match($this->question_type) {
            self::TYPE_MCQ => 'Multiple Choice',
            self::TYPE_MULTIPLE_ANSWER => 'Multiple Answer',
            self::TYPE_TRUE_FALSE => 'True/False',
            self::TYPE_MULTIPLE_TRUE_FALSE => 'Multiple True/False',
            self::TYPE_FILL_BLANKS => 'Fill in the Blanks',
            self::TYPE_MATCHING => 'Matching',
            self::TYPE_DESCRIPTIVE => 'Descriptive',
            default => 'Unknown'
        };
    }

    public function getIsMultipleChoiceAttribute(): bool
    {
        return in_array($this->question_type, [
            self::TYPE_MCQ,
            self::TYPE_MULTIPLE_ANSWER,
            self::TYPE_MULTIPLE_TRUE_FALSE
        ]);
    }

    public function getIsTextBasedAttribute(): bool
    {
        return in_array($this->question_type, [
            self::TYPE_FILL_BLANKS,
            self::TYPE_DESCRIPTIVE
        ]);
    }

    public function getIsRequiredAttribute(): bool
    {
        return $this->attributes['is_required'] ?? true;
    }

    // Methods
    public function validateAnswer($answer): bool
    {
        if (!$this->correct_answer) {
            return false;
        }

        return match($this->question_type) {
            self::TYPE_MCQ => $this->validateMcqAnswer($answer),
            self::TYPE_MULTIPLE_ANSWER => $this->validateMultipleAnswer($answer),
            self::TYPE_TRUE_FALSE => $this->validateTrueFalseAnswer($answer),
            self::TYPE_MULTIPLE_TRUE_FALSE => $this->validateMultipleTrueFalseAnswer($answer),
            self::TYPE_FILL_BLANKS => $this->validateFillBlanksAnswer($answer),
            self::TYPE_MATCHING => $this->validateMatchingAnswer($answer),
            self::TYPE_DESCRIPTIVE => $this->validateDescriptiveAnswer($answer),
            default => false
        };
    }

    private function validateMcqAnswer($answer): bool
    {
        return $answer === $this->correct_answer;
    }

    private function validateMultipleAnswer($answer): bool
    {
        if (!is_array($answer) || !is_array($this->correct_answer)) {
            return false;
        }

        sort($answer);
        sort($this->correct_answer);
        
        return $answer === $this->correct_answer;
    }

    private function validateTrueFalseAnswer($answer): bool
    {
        return in_array($answer, ['true', 'false', true, false]) && 
               $answer == $this->correct_answer;
    }

    private function validateMultipleTrueFalseAnswer($answer): bool
    {
        if (!is_array($answer) || !is_array($this->correct_answer)) {
            return false;
        }

        return $answer === $this->correct_answer;
    }

    private function validateFillBlanksAnswer($answer): bool
    {
        if (!is_array($answer) || !is_array($this->correct_answer)) {
            return false;
        }

        foreach ($this->correct_answer as $index => $correct) {
            if (!isset($answer[$index]) || strtolower(trim($answer[$index])) !== strtolower(trim($correct))) {
                return false;
            }
        }

        return true;
    }

    private function validateMatchingAnswer($answer): bool
    {
        if (!is_array($answer) || !is_array($this->correct_answer)) {
            return false;
        }

        return $answer === $this->correct_answer;
    }

    private function validateDescriptiveAnswer($answer): bool
    {
        // For descriptive questions, we might want to implement keyword matching
        // or manual grading. For now, return true if answer is not empty.
        return !empty(trim($answer));
    }

    public function getOptionsForDisplay(): array
    {
        if (!$this->options) {
            return [];
        }

        // Shuffle options if quiz is randomized
        if ($this->quiz && $this->quiz->is_randomized) {
            $options = $this->options;
            shuffle($options);
            return $options;
        }

        return $this->options;
    }

    public function calculateScore($answer): float
    {
        if ($this->validateAnswer($answer)) {
            return $this->points;
        }

        return 0;
    }
}
