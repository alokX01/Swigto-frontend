import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/PageLoader';
import { getRoleRedirectPath, normalizeRole } from '@/lib/helpers';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = normalizeRole(user?.role || user?.user_type);

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleRedirectPath(role)} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <PageLoader />;

  if (isAuthenticated && user) {
    return <Navigate to={getRoleRedirectPath(user?.role || user?.user_type)} replace />;
  }

  return children;
}
