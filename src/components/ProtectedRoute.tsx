import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from './Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // Redirect to auth page if not logged in
    return <Navigate to="/" replace />;
  }

  // Wrap protected pages with Layout
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;

