<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'marks_obtained',
        'percentage',
        'grade',
        'remarks',
        'submitted_at',
        'evaluated_at',
        'evaluated_by'
    ];

    protected $casts = [
        'marks_obtained' => 'integer',
        'percentage' => 'decimal:2',
        'submitted_at' => 'datetime',
        'evaluated_at' => 'datetime',
    ];

    // Relationships
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Scopes
    public function scopeByExam($query, $examId)
    {
        return $query->where('exam_id', $examId);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopePassed($query)
    {
        return $query->where('marks_obtained', '>=', function($query) {
            $query->select('pass_marks')
                  ->from('exams')
                  ->whereColumn('exams.id', 'exam_results.exam_id');
        });
    }

    public function scopeFailed($query)
    {
        return $query->where('marks_obtained', '<', function($query) {
            $query->select('pass_marks')
                  ->from('exams')
                  ->whereColumn('exams.id', 'exam_results.exam_id');
        });
    }

    // Accessors
    public function getIsPassedAttribute()
    {
        return $this->marks_obtained >= $this->exam->pass_marks;
    }

    public function getGradeTextAttribute()
    {
        return match(true) {
            $this->percentage >= 90 => 'A+',
            $this->percentage >= 80 => 'A',
            $this->percentage >= 70 => 'B+',
            $this->percentage >= 60 => 'B',
            $this->percentage >= 50 => 'C+',
            $this->percentage >= 40 => 'C',
            default => 'F'
        };
    }

    public function getGradeColorAttribute()
    {
        return match(true) {
            $this->percentage >= 80 => 'green',
            $this->percentage >= 60 => 'blue',
            $this->percentage >= 40 => 'yellow',
            default => 'red'
        };
    }

    // Mutators
    public function setMarksObtainedAttribute($value)
    {
        $this->attributes['marks_obtained'] = $value;
        
        if ($this->exam && $this->exam->total_marks > 0) {
            $this->attributes['percentage'] = round(($value / $this->exam->total_marks) * 100, 2);
        }
    }
}


