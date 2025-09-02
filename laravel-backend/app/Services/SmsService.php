<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $client;
    protected $fromNumber;

    public function __construct()
    {
        // Only initialize Twilio if credentials exist
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $this->fromNumber = config('services.twilio.from_number');
        
        if ($accountSid && $authToken && $this->fromNumber) {
            $this->client = new Client($accountSid, $authToken);
        } else {
            $this->client = null;
        }
    }

    /**
     * Send OTP via SMS
     */
    public function sendOtp(string $phone, string $otp): bool
    {
        // If Twilio client is not available, return false
        if (!$this->client) {
            Log::info('Twilio client not available, trying alternative methods');
            return false;
        }
        
        try {
            $message = $this->client->messages->create(
                $phone,
                [
                    'from' => $this->fromNumber,
                    'body' => "Your OTP is: {$otp}. Valid for 5 minutes. Do not share this code."
                ]
            );

            Log::info('SMS sent successfully', [
                'phone' => $phone,
                'message_sid' => $message->sid,
                'status' => $message->status
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send SMS', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send OTP via SMS (Alternative method using cURL for other providers)
     */
    public function sendOtpAlternative(string $phone, string $otp): bool
    {
        try {
            // Try multiple free SMS services
            
            // Option 1: TextLocal (Free tier available)
            if ($this->sendViaTextLocal($phone, $otp)) {
                return true;
            }
            
            // Option 2: MSG91 (Free tier available)
            if ($this->sendViaMsg91($phone, $otp)) {
                return true;
            }
            
            // Option 3: Custom Bangladeshi provider
            if ($this->sendViaCustomProvider($phone, $otp)) {
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to send SMS via alternative method', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
    
    /**
     * Send via TextLocal (Free tier available)
     */
    private function sendViaTextLocal(string $phone, string $otp): bool
    {
        try {
            $apiKey = config('services.sms.textlocal_api_key');
            if (!$apiKey) return false;
            
            $message = "Your OTP is: {$otp}. Valid for 5 minutes.";
            
            $data = [
                'apikey' => $apiKey,
                'numbers' => $phone,
                'message' => $message,
                'sender' => 'TXTLCL'
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.textlocal.in/send/');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                Log::info('SMS sent via TextLocal', [
                    'phone' => $phone,
                    'response' => $response
                ]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('TextLocal SMS failed', ['phone' => $phone, 'error' => $e->getMessage()]);
            return false;
        }
    }
    
    /**
     * Send via MSG91 (Free tier available)
     */
    private function sendViaMsg91(string $phone, string $otp): bool
    {
        try {
            $apiKey = config('services.sms.msg91_api_key');
            if (!$apiKey) return false;
            
            $message = "Your OTP is: {$otp}. Valid for 5 minutes.";
            
            $data = [
                'authkey' => $apiKey,
                'mobiles' => $phone,
                'message' => $message,
                'sender' => 'ACMR',
                'route' => 4
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.msg91.com/api/sendhttp.php');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                Log::info('SMS sent via MSG91', [
                    'phone' => $phone,
                    'response' => $response
                ]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('MSG91 SMS failed', ['phone' => $phone, 'error' => $e->getMessage()]);
            return false;
        }
    }
    
    /**
     * Send via Custom Bangladeshi provider
     */
    private function sendViaCustomProvider(string $phone, string $otp): bool
    {
        try {
            $apiUrl = config('services.sms.api_url');
            $apiKey = config('services.sms.api_key');
            $senderId = config('services.sms.sender_id');
            
            if (!$apiUrl || !$apiKey) return false;

            $message = "Your OTP is: {$otp}. Valid for 5 minutes.";
            
            $data = [
                'api_key' => $apiKey,
                'sender_id' => $senderId,
                'message' => $message,
                'phone' => $phone
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $apiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                Log::info('SMS sent via custom provider', [
                    'phone' => $phone,
                    'response' => $response
                ]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Custom provider SMS failed', ['phone' => $phone, 'error' => $e->getMessage()]);
            return false;
        }
    }
}
