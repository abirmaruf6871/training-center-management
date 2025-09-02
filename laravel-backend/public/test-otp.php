<?php
// Simple OTP test endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../vendor/autoload.php';

use App\Models\User;
use App\Models\Otp;

// Bootstrap Laravel
$app = require_once '../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $phone = $input['phone'] ?? '';
    
    try {
        // Check if user exists
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        // Generate OTP
        $otp = Otp::generateOtp($phone);
        
        echo json_encode([
            'success' => true,
            'message' => 'OTP sent successfully',
            'otp' => $otp, // For testing only
            'phone' => $phone
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Method not allowed']);
}

