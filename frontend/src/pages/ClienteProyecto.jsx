import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ClienteProyecto = () => {
  const { id } = useParams();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const [p, t] = await Promise.all([
        api.get('/proyectos'),
        api.get('/tareas')
      ]);
      const proy = p.data.find(p => p.id === id);
      const tareasDelProyecto = t.data.filter(t => t.proyecto_id === id);
      setProyecto(proy);
      setTareas(tareasDelProyecto);
    };
    cargar();
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const total = tareas.length;
  const completadas = tareas.filter(t => t.estado === 'completado').length;
  const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

  const colorEstado = (estado) => {
    if (estado === 'completado') return 'bg-green-100 text-green-700';
    if (estado === 'en progreso') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const colorPrioridad = (prioridad) => {
    if (prioridad === 'alta') return 'bg-red-100 text-red-700';
    if (prioridad === 'media') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-xl font-bold">TechSolutions — Portal Cliente</span>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/cliente')} className="text-white underline text-sm">
            Mis solicitudes
          </button>
          <span className="text-sm opacity-80">Hola, {usuario?.nombre}</span>
          <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded font-semibold hover:bg-blue-100">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="p-8">
        {proyecto ? (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{proyecto.nombre}</h2>
              <p className="text-gray-500 mb-4">{proyecto.descripcion}</p>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-400">Fecha inicio</p>
                  <p className="font-semibold">{proyecto.fecha_inicio || 'No definida'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Fecha fin</p>
                  <p className="font-semibold">{proyecto.fecha_fin || 'No definida'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstado(proyecto.estado)}`}>
                    {proyecto.estado}
                  </span>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600">Avance del proyecto</span>
                <span className="font-semibold">{completadas}/{total} tareas completadas ({porcentaje}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5">
                <div
                  className="bg-blue-600 h-5 rounded-full transition-all duration-500"
                  style={{ width: `${porcentaje}%` }}>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold text-gray-700">Tareas del proyecto</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="p-3 text-left">Tarea</th>
                    <th className="p-3 text-left">Responsable</th>
                    <th className="p-3 text-left">Prioridad</th>
                    <th className="p-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {tareas.map(t => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{t.nombre}</td>
                      <td className="p-3">{t.responsable || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorPrioridad(t.prioridad)}`}>
                          {t.prioridad}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstado(t.estado)}`}>
                          {t.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tareas.length === 0 && (
                    <tr><td colSpan="4" className="p-6 text-center text-gray-400">No hay tareas registradas aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 mt-20">Cargando proyecto...</div>
        )}
      </div>
    </div>
  );
};

export default ClienteProyecto;