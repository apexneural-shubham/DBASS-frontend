import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';
import { ResetPasswordRequest } from '@/types';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetData, setResetData] = useState<ResetPasswordRequest>({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    // Function to handle redirect from localhost:8000
    const handleLocalhostRedirect = () => {
      // If we're on localhost:8000, extract parameters and redirect to our frontend
      if (window.location.host === 'localhost:8000') {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        
        if (token && email) {
          const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
          window.location.href = `${frontendUrl}/reset-password?token=${token}&email=${email}`;
          return true;
        }
      }
      return false;
    };

    // If we're on localhost:8000, handle the redirect
    if (handleLocalhostRedirect()) {
      return;
    }

    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token');

    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('Reset password URL parameters:', {
        email,
        token: token ? `${token.substring(0, 10)}...` : null,
        fullUrl: window.location.href,
        host: window.location.host
      });
    }

    // Validate that we have the required parameters
    if (!email || !token) {
      toast.error('Invalid or expired reset password link. Please request a new one.', {
        duration: 5000
      });
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
      return;
    }

    // Check if the email exists
    const validateEmail = async () => {
      try {
        const exists = await apiService.checkEmail(email);
        if (!exists) {
          toast.error('Invalid email address. Please request a new reset link.', {
            duration: 5000
          });
          setTimeout(() => {
            navigate('/auth');
          }, 1000);
          return;
        }

        // Update reset data with URL parameters
        setResetData(prev => ({
          ...prev,
          email,
          token
        }));
      } catch (error) {
        toast.error('Failed to validate email. Please try again.', {
          duration: 5000
        });
        setTimeout(() => {
          navigate('/auth');
        }, 1000);
      }
    };

    validateEmail();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log('Reset password attempt with:', {
        email: resetData.email,
        hasToken: !!resetData.token,
        tokenLength: resetData.token?.length
      });
    }
    
    // Validation
    if (!resetData.new_password || !resetData.confirm_password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (resetData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (resetData.new_password !== resetData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Resetting password...', { icon: '🔐' });

    try {
      await apiService.resetPassword(resetData);
      
      toast.dismiss(loadingToast);
      toast.success('Password has been reset successfully!', { 
        icon: '✅', 
        duration: 5000 
      });
      
      // Navigate to login page
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      toast.error(errorMessage, { icon: '❌', duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold text-white">Reset Password</h3>
            <p className="text-slate-400">Enter your new password below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={resetData.email}
                  readOnly
                  className="pl-11 bg-slate-800/50 border-slate-700 text-slate-400 rounded-xl h-12"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={resetData.new_password}
                  onChange={(e) => setResetData({ ...resetData, new_password: e.target.value })}
                  className="pl-11 pr-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={resetData.confirm_password}
                  onChange={(e) => setResetData({ ...resetData, confirm_password: e.target.value })}
                  className="pl-11 pr-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 text-lg font-semibold shadow-lg shadow-orange-500/25 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;