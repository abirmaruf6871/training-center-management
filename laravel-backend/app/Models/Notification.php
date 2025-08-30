<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'recipient_id',
        'type',
        'message',
        'channel',
        'status',
        'sent_at',
        'read_at',
        'metadata'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
        'metadata' => 'array'
    ];

    // Relationships
    public function recipient()
    {
        return $this->belongsTo(Student::class, 'recipient_id');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    // Accessors
    public function getIsReadAttribute()
    {
        return !is_null($this->read_at);
    }

    public function getTypeLabelAttribute()
    {
        $types = [
            'payment_reminder' => 'Payment Reminder',
            'class_reminder' => 'Class Reminder',
            'exam_notice' => 'Exam Notice',
            'batch_starting' => 'Batch Starting',
            'general' => 'General'
        ];

        return $types[$this->type] ?? $this->type;
    }

    public function getChannelLabelAttribute()
    {
        $channels = [
            'sms' => 'SMS',
            'email' => 'Email',
            'both' => 'SMS & Email'
        ];

        return $channels[$this->channel] ?? $this->channel;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'sent' => 'bg-green-100 text-green-800',
            'failed' => 'bg-red-100 text-red-800',
            'pending' => 'bg-yellow-100 text-yellow-800'
        ];

        return $badges[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    // Methods
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function markAsUnread()
    {
        $this->update(['read_at' => null]);
    }

    public function markAsFailed()
    {
        $this->update(['status' => 'failed']);
    }

    public function markAsPending()
    {
        $this->update(['status' => 'pending']);
    }
}

