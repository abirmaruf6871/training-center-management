<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class TestController extends Controller
{
    public function test(): JsonResponse
    {
        return response()->json(['message' => 'Test controller is working!']);
    }
    
    public function testUser(): JsonResponse
    {
        try {
            $user = \App\Models\User::where('username', 'admin')->first();
            if ($user) {
                return response()->json([
                    'message' => 'User found!',
                    'user' => [
                        'username' => $user->username,
                        'role' => $user->role,
                        'is_active' => $user->is_active
                    ]
                ]);
            } else {
                return response()->json(['message' => 'User not found!'], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


