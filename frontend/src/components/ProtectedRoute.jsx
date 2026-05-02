import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" />;

  if (roles && !roles.includes(usuario.rol)) {
    if (usuario.rol === 'cliente') return <Navigate to="/cliente" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;