<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Batch;
use App\Models\Payment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Send Payment Due Reminder
     */
    public function sendPaymentDueReminder(Request $request)
    {
        $request->validate([
            'student_id' => 'nullable|uuid|exists:students,id',
            'batch_id' => 'nullable|uuid|exists:batches,id',
            'branch_id' => 'nullable|uuid|exists:branches,id'
        ]);

        $studentId = $request->student_id;
        $batchId = $request->batch_id;
        $branchId = $request->branch_id;

        // Get students with outstanding dues
        $studentsQuery = Student::with(['course', 'batch', 'branch'])
            ->where('outstanding_dues', '>', 0);

        if ($studentId) {
            $studentsQuery->where('id', $studentId);
        }

        if ($batchId) {
            $studentsQuery->where('batch_id', $batchId);
        }

        if ($branchId) {
            $studentsQuery->where('branch_id', $branchId);
        }

        $students = $studentsQuery->get();

        $sentCount = 0;
        $failedCount = 0;

        foreach ($students as $student) {
            try {
                $this->sendPaymentReminder($student);
                $sentCount++;
            } catch (\Exception $e) {
                Log::error('Failed to send payment reminder to student: ' . $student->id, [
                    'error' => $e->getMessage()
                ]);
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment due reminders sent',
            'data' => [
                'total_students' => $students->count(),
                'sent_count' => $sentCount,
                'failed_count' => $failedCount
            ]
        ]);
    }

    /**
     * Send Class Reminder
     */
    public function sendClassReminder(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|uuid|exists:batches,id',
            'class_date' => 'required|date',
            'reminder_type' => 'required|in:sms,email,both'
        ]);

        $batchId = $request->batch_id;
        $classDate = $request->class_date;
        $reminderType = $request->reminder_type;

        $batch = Batch::with(['students', 'course'])->find($batchId);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $sentCount = 0;
        $failedCount = 0;

        foreach ($batch->students as $student) {
            try {
                if ($reminderType === 'sms' || $reminderType === 'both') {
                    $this->sendSMSClassReminder($student, $batch, $classDate);
                }

                if ($reminderType === 'email' || $reminderType === 'both') {
                    $this->sendEmailClassReminder($student, $batch, $classDate);
                }

                $sentCount++;
            } catch (\Exception $e) {
                Log::error('Failed to send class reminder to student: ' . $student->id, [
                    'error' => $e->getMessage()
                ]);
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Class reminders sent',
            'data' => [
                'batch' => [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'course' => $batch->course->name
                ],
                'class_date' => $classDate,
                'reminder_type' => $reminderType,
                'total_students' => $batch->students->count(),
                'sent_count' => $sentCount,
                'failed_count' => $failedCount
            ]
        ]);
    }

    /**
     * Send Exam Notice
     */
    public function sendExamNotice(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|uuid|exists:batches,id',
            'exam_date' => 'required|date',
            'exam_subject' => 'required|string',
            'exam_time' => 'required|string',
            'exam_venue' => 'required|string',
            'notice_type' => 'required|in:sms,email,both'
        ]);

        $batchId = $request->batch_id;
        $examDate = $request->exam_date;
        $examSubject = $request->exam_subject;
        $examTime = $request->exam_time;
        $examVenue = $request->exam_venue;
        $noticeType = $request->notice_type;

        $batch = Batch::with(['students', 'course'])->find($batchId);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $sentCount = 0;
        $failedCount = 0;

        foreach ($batch->students as $student) {
            try {
                if ($noticeType === 'sms' || $noticeType === 'both') {
                    $this->sendSMSExamNotice($student, $batch, $examDate, $examSubject, $examTime, $examVenue);
                }

                if ($noticeType === 'email' || $noticeType === 'both') {
                    $this->sendEmailExamNotice($student, $batch, $examDate, $examSubject, $examTime, $examVenue);
                }

                $sentCount++;
            } catch (\Exception $e) {
                Log::error('Failed to send exam notice to student: ' . $student->id, [
                    'error' => $e->getMessage()
                ]);
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Exam notices sent',
            'data' => [
                'batch' => [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'course' => $batch->course->name
                ],
                'exam_details' => [
                    'date' => $examDate,
                    'subject' => $examSubject,
                    'time' => $examTime,
                    'venue' => $examVenue
                ],
                'notice_type' => $noticeType,
                'total_students' => $batch->students->count(),
                'sent_count' => $sentCount,
                'failed_count' => $failedCount
            ]
        ]);
    }

    /**
     * Send Batch Starting Announcement
     */
    public function sendBatchStartingAnnouncement(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|uuid|exists:batches,id',
            'announcement_type' => 'required|in:sms,email,both'
        ]);

        $batchId = $request->batch_id;
        $announcementType = $request->announcement_type;

        $batch = Batch::with(['students', 'course', 'faculty'])->find($batchId);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $sentCount = 0;
        $failedCount = 0;

        foreach ($batch->students as $student) {
            try {
                if ($announcementType === 'sms' || $announcementType === 'both') {
                    $this->sendSMSBatchStartingAnnouncement($student, $batch);
                }

                if ($announcementType === 'email' || $announcementType === 'both') {
                    $this->sendEmailBatchStartingAnnouncement($student, $batch);
                }

                $sentCount++;
            } catch (\Exception $e) {
                Log::error('Failed to send batch starting announcement to student: ' . $student->id, [
                    'error' => $e->getMessage()
                ]);
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Batch starting announcements sent',
            'data' => [
                'batch' => [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'course' => $batch->course->name,
                    'start_date' => $batch->start_date,
                    'faculty' => $batch->faculty->name ?? 'N/A'
                ],
                'announcement_type' => $announcementType,
                'total_students' => $batch->students->count(),
                'sent_count' => $sentCount,
                'failed_count' => $failedCount
            ]
        ]);
    }

    /**
     * Get Notification History
     */
    public function getNotificationHistory(Request $request)
    {
        $request->validate([
            'type' => 'nullable|string',
            'recipient_id' => 'nullable|uuid',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        $query = Notification::query();

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->recipient_id) {
            $query->where('recipient_id', $request->recipient_id);
        }

        if ($request->start_date) {
            $query->where('created_at', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->where('created_at', '<=', $request->end_date);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Send Payment Reminder (SMS)
     */
    private function sendPaymentReminder($student)
    {
        $message = "Dear {$student->first_name}, you have outstanding dues of ৳{$student->outstanding_dues} for {$student->course->name}. Please clear your dues to continue your studies. Contact: {$student->branch->phone}";

        // Log the SMS (in production, integrate with actual SMS service)
        Log::info('SMS Payment Reminder sent', [
            'student_id' => $student->id,
            'phone' => $student->phone,
            'message' => $message
        ]);

        // Create notification record
        $this->createNotificationRecord($student->id, 'payment_reminder', $message, 'sms');
    }

    /**
     * Send SMS Class Reminder
     */
    private function sendSMSClassReminder($student, $batch, $classDate)
    {
        $message = "Dear {$student->first_name}, reminder: {$batch->course->name} class tomorrow ({$classDate}) at {$batch->start_time}. Venue: {$batch->venue}. Don't miss it!";

        Log::info('SMS Class Reminder sent', [
            'student_id' => $student->id,
            'phone' => $student->phone,
            'message' => $message
        ]);

        $this->createNotificationRecord($student->id, 'class_reminder', $message, 'sms');
    }

    /**
     * Send Email Class Reminder
     */
    private function sendEmailClassReminder($student, $batch, $classDate)
    {
        $subject = "Class Reminder - {$batch->course->name}";
        $message = "Dear {$student->first_name},\n\nThis is a reminder for your {$batch->course->name} class tomorrow.\n\nDetails:\n- Date: {$classDate}\n- Time: {$batch->start_time}\n- Venue: {$batch->venue}\n\nPlease ensure you attend the class.\n\nBest regards,\n{$batch->branch->name}";

        // Log the email (in production, send actual email)
        Log::info('Email Class Reminder sent', [
            'student_id' => $student->id,
            'email' => $student->email,
            'subject' => $subject,
            'message' => $message
        ]);

        $this->createNotificationRecord($student->id, 'class_reminder', $message, 'email');
    }

    /**
     * Send SMS Exam Notice
     */
    private function sendSMSExamNotice($student, $batch, $examDate, $examSubject, $examTime, $examVenue)
    {
        $message = "Dear {$student->first_name}, {$examSubject} exam on {$examDate} at {$examTime}. Venue: {$examVenue}. Good luck!";

        Log::info('SMS Exam Notice sent', [
            'student_id' => $student->id,
            'phone' => $student->phone,
            'message' => $message
        ]);

        $this->createNotificationRecord($student->id, 'exam_notice', $message, 'sms');
    }

    /**
     * Send Email Exam Notice
     */
    private function sendEmailExamNotice($student, $batch, $examDate, $examSubject, $examTime, $examVenue)
    {
        $subject = "Exam Notice - {$examSubject}";
        $message = "Dear {$student->first_name},\n\nThis is to inform you about your upcoming exam.\n\nExam Details:\n- Subject: {$examSubject}\n- Date: {$examDate}\n- Time: {$examTime}\n- Venue: {$examVenue}\n\nPlease arrive 15 minutes before the exam time.\n\nBest of luck!\n\nBest regards,\n{$batch->branch->name}";

        Log::info('Email Exam Notice sent', [
            'student_id' => $student->id,
            'email' => $student->email,
            'subject' => $subject,
            'message' => $message
        ]);

        $this->createNotificationRecord($student->id, 'exam_notice', $message, 'email');
    }

    /**
     * Send SMS Batch Starting Announcement
     */
    private function sendSMSBatchStartingAnnouncement($student, $batch)
    {
        $facultyName = $batch->faculty ? $batch->faculty->name : 'TBA';
        $message = "Dear {$student->first_name}, welcome to {$batch->course->name}! Your batch starts on {$batch->start_date}. Faculty: {$facultyName}. Venue: {$batch->venue}. See you there!";

        Log::info('SMS Batch Starting Announcement sent', [
            'student_id' => $student->id,
            'phone' => $student->phone,
            'message' => $message
        ]);

        $this->createNotificationRecord($student->id, 'batch_starting', $message, 'sms');
    }

    /**
     * Send Email Batch Starting Announcement
     */
    private function sendEmailBatchStartingAnnouncement($student, $batch)
    {
        $subject = "Welcome to {$batch->course->name} - Batch Starting Soon!";
        $facultyName = $batch->faculty ? $batch->faculty->name : 'To be announced';
        $message = "Dear {$student->first_name},\n\nWelcome to {$batch->course->name}! We're excited to have you join us.\n\nBatch Details:\n- Batch Name: {$batch->name}\n- Start Date: {$batch->start_date}\n- Faculty: {$facultyName}\n- Venue: {$batch->venue}\n- Schedule: {$batch->schedule}\n\nPlease bring your ID and arrive 10 minutes before the start time.\n\nWe look forward to seeing you!\n\nBest regards,\n{$batch->branch->name}";

        Log::info('Email Batch Starting Announcement sent', [
            'student_id' => $student->id,
            'email' => $student->email,
            'subject' => $subject,
            'message' => $message
        ]);

        $this->createNotificationRecord($student->id, 'batch_starting', $message, 'email');
    }

    /**
     * Create Notification Record
     */
    private function createNotificationRecord($recipientId, $type, $message, $channel)
    {
        Notification::create([
            'recipient_id' => $recipientId,
            'type' => $type,
            'message' => $message,
            'channel' => $channel,
            'status' => 'sent',
            'sent_at' => now()
        ]);
    }
}
