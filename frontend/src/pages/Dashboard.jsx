import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bienvenido, {usuario?.nombre} 👋
        </h2>
        <p className="text-gray-500 mb-8">Panel de control de TechSolutions</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Módulo</p>
            <p className="text-xl font-bold text-blue-700">Clientes</p>
            <p className="text-gray-400 text-sm mt-1">Gestión de clientes</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Módulo</p>
            <p className="text-xl font-bold text-green-700">Proyectos</p>
            <p className="text-gray-400 text-sm mt-1">Gestión de proyectos</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Módulo</p>
            <p className="text-xl font-bold text-purple-700">Tareas</p>
            <p className="text-gray-400 text-sm mt-1">Seguimiento de tareas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;