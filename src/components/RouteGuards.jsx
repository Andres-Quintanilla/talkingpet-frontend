import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth(); 
  const loc = useLocation();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ returnTo: loc.pathname + loc.search }} />;
  }

  return children;
}

/**
 * Redirige si el usuario no tiene UNO de los roles permitidos.
 * @param {{roles: string[]}} props
 */
export function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
      </div>
    );
  }

  const loginPath = roles.includes('admin') ? '/admin/login' : '/login';

  if (!user) {
    return <Navigate to={loginPath} replace state={{ returnTo: loc.pathname + loc.search }} />;
  }

  if (!roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}