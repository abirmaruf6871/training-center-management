import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-700 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="text-white text-2xl" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ACMR Academy</h2>
          <p className="text-gray-600">Training Center Management System</p>
        </div>
        
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to ACMR Academy
                </h3>
                <p className="text-gray-600 text-sm">
                  Access your training center management dashboard
                </p>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-blue-700 hover:bg-blue-800 transition-colors"
                size="lg"
                data-testid="button-login"
              >
                Sign In
              </Button>
              
              <div className="text-center text-xs text-gray-500">
                <p>Secure authentication powered by Replit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
