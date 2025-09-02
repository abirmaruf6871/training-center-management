<?php

require_once 'vendor/autoload.php';

use App\Models\Batch;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Branch;

echo "🧪 Testing Batch Management API\n";
echo "================================\n\n";

try {
    // Test 1: Check if models exist
    echo "1. Testing Models...\n";
    
    $batchCount = Batch::count();
    echo "   - Batches in database: {$batchCount}\n";
    
    $facultyCount = Faculty::count();
    echo "   - Faculties in database: {$facultyCount}\n";
    
    $courseCount = Course::count();
    echo "   - Courses in database: {$courseCount}\n";
    
    $branchCount = Branch::count();
    echo "   - Branches in database: {$branchCount}\n";
    
    echo "   ✅ Models test completed\n\n";
    
    // Test 2: Test relationships
    echo "2. Testing Relationships...\n";
    
    if ($batchCount > 0) {
        $batch = Batch::with(['course', 'branch', 'faculty'])->first();
        echo "   - Sample batch: {$batch->name}\n";
        echo "   - Course: " . ($batch->course ? $batch->course->name : 'N/A') . "\n";
        echo "   - Branch: " . ($batch->branch ? $batch->branch->name : 'N/A') . "\n";
        echo "   - Faculty: " . ($batch->faculty ? $batch->faculty->name : 'N/A') . "\n";
        echo "   ✅ Relationships test completed\n\n";
    }
    
    // Test 3: Test API endpoints
    echo "3. Testing API Endpoints...\n";
    
    $baseUrl = 'http://localhost:8000/api';
    
    // Test batches endpoint
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "{$baseUrl}/batches-public");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "   - GET /batches-public: ✅ Success ({$httpCode})\n";
        echo "   - Response: " . ($data['success'] ? 'Success' : 'Failed') . "\n";
        if (isset($data['data']['data'])) {
            echo "   - Batches returned: " . count($data['data']['data']) . "\n";
        }
    } else {
        echo "   - GET /batches-public: ❌ Failed ({$httpCode})\n";
    }
    
    // Test faculties endpoint
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "{$baseUrl}/faculties-public");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "   - GET /faculties-public: ✅ Success ({$httpCode})\n";
        echo "   - Response: " . ($data['success'] ? 'Success' : 'Failed') . "\n";
        if (isset($data['data']['data'])) {
            echo "   - Faculties returned: " . count($data['data']['data']) . "\n";
        }
    } else {
        echo "   - GET /faculties-public: ❌ Failed ({$httpCode})\n";
    }
    
    echo "   ✅ API endpoints test completed\n\n";
    
    echo "🎉 All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error occurred: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}


