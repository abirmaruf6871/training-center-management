<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'totalStudents' => 156,
                'monthlyIncome' => 450000,
                'pendingDues' => 125000,
                'activeCourses' => 8
            ]
        ]);
    }
}
