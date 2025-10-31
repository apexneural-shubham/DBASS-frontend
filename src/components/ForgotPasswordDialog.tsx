import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';

interface ForgotPasswordDialogProps {
  trigger?: React.ReactNode;
}

export const ForgotPasswordDialog = ({ trigger }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Checking email...', { icon: '🔍' });

    try {
      // First check if the email exists
      const emailExists = await apiService.checkEmail(email);
      if (emailExists === false) {
        toast.dismiss(loadingToast);
        setError('No account found with this email address. Please check the email or sign up.');
        toast.error('No account found with this email address. Please check the email or sign up.', {
          icon: '❌',
          duration: 5000,
        });
        return;
      }
      // If emailExists is true or truthy, proceed
      toast.dismiss(loadingToast);
      console.log('Calling forgotPassword API for:', email); // DEBUG LOG
      const sendingToast = toast.loading('Sending reset link...', { icon: '📧' });
      await apiService.forgotPassword({ email });
      toast.dismiss(sendingToast);
      toast.success('Password reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password.', {
        icon: '✉️',
        duration: 7000,
      });
      setIsOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { icon: '❌', duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="link" className="px-0">Forgot Password?</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          {/* Error message above Send Reset Link button */}
          {error && (
            <div className="text-red-500 text-sm text-center mb-2">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};