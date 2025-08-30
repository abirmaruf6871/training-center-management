<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'specialization',
        'qualification',
        'experience_years',
        'bio',
        'is_active'
    ];

    protected $casts = [
        'experience_years' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBySpecialization($query, $specialization)
    {
        return $query->where('specialization', 'like', "%{$specialization}%");
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    public function getExperienceTextAttribute()
    {
        if ($this->experience_years === 1) {
            return '1 year';
        }
        return "{$this->experience_years} years";
    }
}

