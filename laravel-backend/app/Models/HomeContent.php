<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HomeContent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'section',
        'title',
        'subtitle',
        'description',
        'content',
        'is_active',
        'order'
    ];

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean',
        'order' => 'integer'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function scopeBySection($query, $section)
    {
        return $query->where('section', $section);
    }

    // Accessors
    public function getIsActiveAttribute($value): bool
    {
        return (bool) $value;
    }

    public function getContentAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    // Mutators
    public function setContentAttribute($value): void
    {
        $this->attributes['content'] = json_encode($value);
    }
}

