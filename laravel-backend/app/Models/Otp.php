<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;

class Otp extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'phone',
        'otp',
        'expires_at',
        'is_used',
        'attempts'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Check if OTP is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if OTP is valid (not expired and not used)
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->is_used;
    }

    /**
     * Mark OTP as used
     */
    public function markAsUsed(): void
    {
        $this->update(['is_used' => true]);
    }

    /**
     * Increment attempts
     */
    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    /**
     * Generate a new OTP
     */
    public static function generateOtp(string $phone): string
    {
        // For now, use fixed OTP: 123456
        $otp = '123456';
        
        // Delete any existing OTPs for this phone
        self::where('phone', $phone)->delete();
        
        // Create new OTP
        self::create([
            'id' => \Illuminate\Support\Str::uuid(), // Generate UUID for id
            'phone' => $phone,
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(5), // OTP expires in 5 minutes
            'is_used' => false,
            'attempts' => 0
        ]);
        
        return $otp;
    }

    /**
     * Verify OTP
     */
    public static function verifyOtp(string $phone, string $otp): bool
    {
        $otpRecord = self::where('phone', $phone)
                         ->where('otp', $otp)
                         ->where('is_used', false)
                         ->first();
        
        if (!$otpRecord) {
            return false;
        }
        
        if ($otpRecord->isExpired()) {
            return false;
        }
        
        if ($otpRecord->attempts >= 3) {
            return false;
        }
        
        // Mark as used
        $otpRecord->markAsUsed();
        
        return true;
    }
}
