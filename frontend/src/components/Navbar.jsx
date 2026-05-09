import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const esAdmin = usuario?.rol === 'admin';

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <span className="text-xl font-bold">TechSolutions</span>
      <div className="flex gap-6 items-center">
        <Link to="/dashboard" className="hover:underline">Inicio</Link>
        <Link to="/clientes" className="hover:underline">Clientes</Link>
        <Link to="/proyectos" className="hover:underline">Proyectos</Link>
        <Link to="/tareas" className="hover:underline">Tareas</Link>
        {(esAdmin || usuario?.rol === 'trabajador') && (
  <Link to="/reportes" className="hover:underline">Reportes</Link>
)}
        {esAdmin && <Link to="/solicitudes" className="hover:underline">Solicitudes</Link>}
        {esAdmin && <Link to="/graficas" className="hover:underline">Gráficas</Link>}
        {esAdmin && <Link to="/usuarios" className="hover:underline">Usuarios</Link>}
        <span className="text-sm opacity-80">Hola, {usuario?.nombre}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-3 py-1 rounded font-semibold hover:bg-blue-100">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;