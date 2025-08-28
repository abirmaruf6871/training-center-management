<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }
}
