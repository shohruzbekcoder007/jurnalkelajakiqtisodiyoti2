import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="hu-admin">
        <p className="hu-loading">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return children;
}
