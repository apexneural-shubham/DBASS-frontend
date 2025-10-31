import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, TrendingUp, Target } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const AuthPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    country: '',
    receive_newsletters: false,
    accept_terms: false,
    accept_privacy_policy: false,
  });

  // Error message state for login and forgot password
  const [loginError, setLoginError] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Validation
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!loginData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Logging in...', { icon: '🔐' });

    try {
      // Call the actual API
      const response = await apiService.login(loginData);
      
      // Store auth data
      setAuth(response.data.user, response.data.token);
      
      toast.dismiss(loadingToast);
      toast.success('Welcome back!', { icon: '👋', duration: 2000 });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setLoginError(errorMessage); // Set error above Sign In
      toast.error(errorMessage, { icon: '❌', duration: 4000 });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupData.first_name || !signupData.last_name || !signupData.username || 
        !signupData.email || !signupData.password || !signupData.confirm_password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!signupData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (signupData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (signupData.password !== signupData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (!signupData.accept_terms) {
      toast.error('You must accept the Terms of Service');
      return;
    }

    if (!signupData.accept_privacy_policy) {
      toast.error('You must accept the Privacy Policy');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating account...', { icon: '✨' });

    try {
      // Call the actual API
      const response = await apiService.signup(signupData);
      
      // Store auth data
      setAuth(response.data.user, response.data.token);
      
      toast.dismiss(loadingToast);
      toast.success('Account created successfully!', { icon: '🎉', duration: 2000 });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      toast.error(errorMessage, { icon: '❌', duration: 4000 });
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                DBASS
              </h1>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-white leading-tight"
            >
              Discover Market
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Opportunities
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-lg leading-relaxed"
            >
              AI-powered market research and trend analysis platform. 
              Uncover pain points, identify gaps, and build winning solutions.
            </motion.p>
          </div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {[
              { icon: TrendingUp, text: 'Real-time trending topics analysis', color: 'from-green-500 to-emerald-500' },
              { icon: Target, text: 'Pain point identification from Reddit discussions', color: 'from-orange-500 to-red-500' },
              { icon: Sparkles, text: 'AI-powered market gap discovery', color: 'from-cyan-500 to-blue-500' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`p-2 bg-gradient-to-br ${feature.color} rounded-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-300">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Auth form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-white">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-slate-400">
                  {isLogin 
                    ? 'Sign in to continue your market research' 
                    : 'Get started with DBASS today'}
                </p>
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="pl-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-12"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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

                    {/* Forgot password */}
                    <div className="flex justify-end">
                      <ForgotPasswordDialog
                        trigger={
                          <Button
                            type="button"
                            variant="link"
                            className="text-sm text-orange-400 hover:text-orange-300 transition-colors p-0 h-auto font-normal"
                            disabled={isLoading}
                          >
                            Forgot password?
                          </Button>
                        }
                      />
                    </div>

                    {/* Error message */}
                    {loginError && (
                      <div className="text-red-500 text-sm text-center">
                        {loginError}
                      </div>
                    )}

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 text-lg font-semibold shadow-lg shadow-orange-500/25 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSignup}
                    className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
                  >
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-first-name" className="text-slate-300 text-sm">First Name *</Label>
                        <Input
                          id="signup-first-name"
                          type="text"
                          placeholder="John"
                          value={signupData.first_name}
                          onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-last-name" className="text-slate-300 text-sm">Last Name *</Label>
                        <Input
                          id="signup-last-name"
                          type="text"
                          placeholder="Doe"
                          value={signupData.last_name}
                          onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-username" className="text-slate-300 text-sm">Username *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="signup-username"
                          type="text"
                          placeholder="johndoe123"
                          value={signupData.username}
                          onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-300 text-sm">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-300 text-sm">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">Must be at least 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-slate-300 text-sm">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={signupData.confirm_password}
                          onChange={(e) => setSignupData({ ...signupData, confirm_password: e.target.value })}
                          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Optional Fields Divider */}
                    <div className="border-t border-slate-700 pt-3">
                      <p className="text-xs text-slate-400 mb-3">Optional Information</p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-slate-300 text-sm">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={signupData.phone_number}
                        onChange={(e) => setSignupData({ ...signupData, phone_number: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Date of Birth & Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-dob" className="text-slate-300 text-sm">Date of Birth</Label>
                        <Input
                          id="signup-dob"
                          type="date"
                          value={signupData.date_of_birth}
                          onChange={(e) => setSignupData({ ...signupData, date_of_birth: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white focus:border-orange-500 rounded-xl h-11 text-sm"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-gender" className="text-slate-300 text-sm">Gender</Label>
                        <select
                          id="signup-gender"
                          value={signupData.gender}
                          onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500 rounded-xl h-11 text-sm px-3"
                          disabled={isLoading}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-country" className="text-slate-300 text-sm">Country</Label>
                      <Input
                        id="signup-country"
                        type="text"
                        placeholder="United States"
                        value={signupData.country}
                        onChange={(e) => setSignupData({ ...signupData, country: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-2">
                        <input
                          id="signup-newsletters"
                          type="checkbox"
                          checked={signupData.receive_newsletters}
                          onChange={(e) => setSignupData({ ...signupData, receive_newsletters: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800/50 text-orange-500 focus:ring-orange-500"
                          disabled={isLoading}
                        />
                        <Label htmlFor="signup-newsletters" className="text-slate-300 text-xs cursor-pointer">
                          I want to receive newsletters and updates
                        </Label>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          id="signup-terms"
                          type="checkbox"
                          checked={signupData.accept_terms}
                          onChange={(e) => setSignupData({ ...signupData, accept_terms: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800/50 text-orange-500 focus:ring-orange-500"
                          disabled={isLoading}
                        />
                        <Label htmlFor="signup-terms" className="text-slate-300 text-xs cursor-pointer">
                          I accept the <span className="text-orange-400">Terms of Service</span> *
                        </Label>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          id="signup-privacy"
                          type="checkbox"
                          checked={signupData.accept_privacy_policy}
                          onChange={(e) => setSignupData({ ...signupData, accept_privacy_policy: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800/50 text-orange-500 focus:ring-orange-500"
                          disabled={isLoading}
                        />
                        <Label htmlFor="signup-privacy" className="text-slate-300 text-xs cursor-pointer">
                          I accept the <span className="text-orange-400">Privacy Policy</span> *
                        </Label>
                      </div>
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-11 text-base font-semibold shadow-lg shadow-orange-500/25 transition-all mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-slate-500">OR</span>
                </div>
              </div>

              {/* Toggle mode */}
              <div className="text-center">
                <p className="text-slate-400">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  {' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                    disabled={isLoading}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

