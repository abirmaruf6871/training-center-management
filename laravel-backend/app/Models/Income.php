<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Income extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'branch_id',
        'user_id',
        'title',
        'description',
        'amount',
        'type',
        'payment_method',
        'reference_number',
        'income_date',
        'status',
        'metadata'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'income_date' => 'date',
        'metadata' => 'array'
    ];

    // Relationships
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeReceived($query)
    {
        return $query->where('status', 'received');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('income_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedAmountAttribute()
    {
        return '৳' . number_format($this->amount, 2);
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'received' => 'bg-green-100 text-green-800',
            'pending' => 'bg-yellow-100 text-yellow-800',
            'cancelled' => 'bg-red-100 text-red-800'
        ];
        
        return $badges[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    // Methods
    public function markAsReceived()
    {
        $this->update(['status' => 'received']);
    }

    public function markAsPending()
    {
        $this->update(['status' => 'pending']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }
}
