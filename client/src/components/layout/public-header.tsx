"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Users, 
  GraduationCap,
  Search,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  LogIn,
  User,
  Menu,
  X
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PublicHeader() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { toast } = useToast();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
                       const [loginForm, setLoginForm] = useState({
            phone: '',
            otp: ''
          });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOtp(true);
    
    try {
      await apiService.sendOtp(loginForm.phone);
      setOtpSent(true);
      setCountdown(60); // Start 60 second countdown
      toast({ title: "Success", description: "OTP sent to your mobile number!" });
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({ title: "Error", description: "Failed to send OTP. Please try again.", variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const response = await apiService.verifyOtp(loginForm.phone, loginForm.otp);
      
      // Use the useAuth login method with the response data
      login(response.user, response.token);
      
      setIsLoginOpen(false);
      setLoginForm({ phone: '', otp: '' });
      setOtpSent(false);
      setCountdown(0);
      toast({ title: "Success", description: "Logged in successfully!" });
      
      // Auto-redirect admin users to dashboard
      if (response.user.role === 'admin') {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000); // 1 second delay to show success message
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast({ title: "Error", description: "Invalid OTP. Please try again.", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsSendingOtp(true);
    try {
      await apiService.sendOtp(loginForm.phone);
      setCountdown(60);
      toast({ title: "Success", description: "OTP resent successfully!" });
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast({ title: "Error", description: "Failed to resend OTP.", variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Success", description: "Logged out successfully!" });
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-3 text-sm border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 hover:text-blue-200 transition-colors">
                <MapPin className="h-4 w-4 text-blue-300" />
                <span className="font-medium">23/A, Dhaka Cantonment Road, Mirpur-11, Dhaka</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-200 transition-colors">
                <Mail className="h-4 w-4 text-blue-300" />
                <span className="font-medium">contact@acmr.com</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-blue-200 font-medium">Follow Us</span>
                <div className="flex gap-3">
                  <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              {!isAuthenticated ? (
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-blue-800 hover:text-blue-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-lg">
                    <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-blue-900" />
                    </div>
                                         <span className="text-sm font-medium">Welcome, {user?.firstName} {user?.lastName}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-blue-800 hover:text-blue-100 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </Button>
                  {user?.role === 'admin' && (
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white hover:text-blue-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    >
                      Admin Panel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  ACMR ACADEMY
                </h1>
                <p className="text-sm text-gray-600 font-medium">Excellence in Education</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="/" className="text-gray-900 hover:text-blue-600 transition-all duration-200 font-semibold text-lg relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#courses" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg relative group">
                Courses
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#instructors" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg relative group">
                Instructors
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="hidden md:flex border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium px-4 py-2">
                <BookOpen className="h-4 w-4 mr-2" />
                Categories
              </Button>
              {isAuthenticated && (
                <Button variant="outline" size="sm" className="hidden md:flex border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 font-medium px-4 py-2">
                  <User className="h-4 w-4 mr-2" />
                  My Courses
                </Button>
              )}
              <Button variant="outline" size="sm" className="hidden md:flex border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-200 px-4 py-2">
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-6 py-6 space-y-4">
              <a href="/" className="block text-gray-900 hover:text-blue-600 transition-all duration-200 font-semibold text-lg py-2 border-l-4 border-transparent hover:border-blue-600 pl-4">
                Home
              </a>
              <a href="#courses" className="block text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg py-2 border-l-4 border-transparent hover:border-blue-600 pl-4">
                Courses
              </a>
              <a href="#about" className="block text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg py-2 border-l-4 border-transparent hover:border-blue-600 pl-4">
                About Us
              </a>
              <a href="#instructors" className="block text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg py-2 border-l-4 border-transparent hover:border-blue-600 pl-4">
                Instructors
              </a>
              <a href="#contact" className="block text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-lg py-2 border-l-4 border-transparent hover:border-blue-600 pl-4">
                Contact
              </a>
              {isAuthenticated && (
                <a href="/dashboard" className="block text-blue-600 hover:text-blue-700 transition-all duration-200 font-semibold text-lg py-2 border-l-4 border-blue-600 pl-4 bg-blue-50">
                  Dashboard
                </a>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Professional Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Welcome Back</DialogTitle>
            <p className="text-blue-100 text-sm">Sign in to access your account</p>
          </div>
          
                     {/* Login Form */}
           <div className="p-6">
             {!otpSent ? (
               // Step 1: Mobile Number Input
               <form onSubmit={handleSendOtp} className="space-y-5">
                 <div className="space-y-2">
                   <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                     Mobile Number
                   </Label>
                   <div className="relative">
                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input
                       id="phone"
                       type="tel"
                       value={loginForm.phone}
                       onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                       placeholder="Enter your mobile number (e.g., 01611153510)"
                       className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                       required
                       pattern="01[3-9][0-9]{8}"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Format: 01XXXXXXXXX (11 digits)</p>
                 </div>
                 
                 <Button 
                   type="submit" 
                   className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                   disabled={isSendingOtp}
                 >
                   {isSendingOtp ? (
                     <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                       Sending OTP...
                     </div>
                   ) : (
                     <div className="flex items-center justify-center">
                       <Phone className="h-5 w-5 mr-2" />
                       Send OTP
                     </div>
                   )}
                 </Button>
               </form>
             ) : (
               // Step 2: OTP Verification
               <form onSubmit={handleVerifyOtp} className="space-y-5">
                 <div className="text-center mb-4">
                   <p className="text-sm text-gray-600 mb-2">
                     OTP sent to <span className="font-semibold">{loginForm.phone}</span>
                   </p>
                   <p className="text-xs text-gray-500">
                     Enter the 6-digit code sent to your mobile
                   </p>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                     OTP Code
                   </Label>
                   <div className="relative">
                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
                       <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                     </div>
                     <Input
                       id="otp"
                       type="text"
                       value={loginForm.otp}
                       onChange={(e) => setLoginForm({ ...loginForm, otp: e.target.value })}
                       placeholder="Enter 6-digit OTP"
                       className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-lg font-mono"
                       required
                       maxLength={6}
                       pattern="[0-9]{6}"
                     />
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <Button
                     type="button"
                     variant="ghost"
                     onClick={() => {
                       setOtpSent(false);
                       setLoginForm({ phone: '', otp: '' });
                       setCountdown(0);
                     }}
                     className="text-blue-600 hover:text-blue-700"
                   >
                     ← Change Number
                   </Button>
                   
                   <Button
                     type="button"
                     variant="ghost"
                     onClick={handleResendOtp}
                     disabled={countdown > 0}
                     className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                   >
                     {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                   </Button>
                 </div>
                 
                 <Button 
                   type="submit" 
                   className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                   disabled={isLoggingIn}
                 >
                   {isLoggingIn ? (
                     <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                       Verifying...
                     </div>
                   ) : (
                     <div className="flex items-center justify-center">
                       <LogIn className="h-5 w-5 mr-2" />
                       Verify & Login
                     </div>
                   )}
                 </Button>
               </form>
             )}
            
            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to ACMR Academy?</span>
                </div>
              </div>
            </div>
            
            {/* Sign up button */}
            <Button 
              variant="outline" 
              className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200"
              onClick={() => {
                // TODO: Implement sign up functionality
                toast({ title: "Coming Soon", description: "Sign up functionality will be available soon!" });
              }}
            >
              <User className="h-5 w-5 mr-2" />
              Create New Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
