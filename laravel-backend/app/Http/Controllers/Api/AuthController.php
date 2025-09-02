<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and create token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
                   ->where('is_active', true)
                   ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Update last login
        $user->update(['last_login' => now()]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'profileImageUrl' => $user->profile_image_url,
                'role' => $user->role,
                'branchId' => $user->branch_id,
                'phone' => $user->phone,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'profileImageUrl' => $user->profile_image_url,
            'role' => $user->role,
            'branchId' => $user->branch_id,
            'phone' => $user->phone,
        ]);
    }

    /**
     * Send OTP to mobile number
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|regex:/^01[3-9]\d{8}$/',
        ]);

        $phone = $request->phone;
        
        // Check if user exists with this phone number
        $user = User::where('phone', $phone)->where('is_active', true)->first();
        
        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['No user found with this mobile number.'],
            ]);
        }

        // Generate OTP (fixed for development)
        $otp = Otp::generateOtp($phone);
        
        // For development: always return fixed OTP
        return response()->json([
            'message' => 'OTP sent successfully (development mode - use: 123456)',
            'otp' => $otp, // Fixed OTP: 123456
            'expires_in' => 300, // 5 minutes in seconds
            'development_mode' => true
        ]);
        
        // TODO: Uncomment below for production SMS sending
        /*
        // Send OTP via SMS
        $smsService = new SmsService();
        $smsSent = $smsService->sendOtp($phone, $otp);
        
        if (!$smsSent) {
            // Try alternative SMS method
            $smsSent = $smsService->sendOtpAlternative($phone, $otp);
        }
        
        if ($smsSent) {
            return response()->json([
                'message' => 'OTP sent successfully to your mobile',
                'expires_in' => 300 // 5 minutes in seconds
            ]);
        } else {
            return response()->json([
                'message' => 'Failed to send OTP. Please try again.',
            ], 500);
        }
        */
    }

    /**
     * Verify OTP and login user
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|regex:/^01[3-9]\d{8}$/',
            'otp' => 'required|string|size:6',
        ]);

        $phone = $request->phone;
        $otp = $request->otp;

        // Verify OTP
        if (!Otp::verifyOtp($phone, $otp)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }

        // Get user
        $user = User::where('phone', $phone)->where('is_active', true)->first();
        
        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['User not found.'],
            ]);
        }

        // Update last login
        $user->update(['last_login' => now()]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'profileImageUrl' => $user->profile_image_url,
                'role' => $user->role,
                'branchId' => $user->branch_id,
                'phone' => $user->phone,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }
}
