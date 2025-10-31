import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isSettingsPage = location.pathname === '/settings';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully', { icon: '👋' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-white/10 backdrop-blur-sm px-8 py-3 rounded-full shadow-xl">
            <h1 className="text-xl font-bold text-white tracking-wide">DBAAS</h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 text-white bg-white/5 px-4 py-2 rounded-xl">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
              </div>
            )}
            
            <Link to="/settings">
              <Button 
                variant={isSettingsPage ? "default" : "ghost"} 
                size="sm" 
                className={`rounded-xl ${
                  isSettingsPage 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>

            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-white hover:bg-white/10 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Link to="/">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
