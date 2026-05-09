import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

const Usuarios = () => {
  const [pendientes, setPendientes] = useState([]);
  const [aprobados, setAprobados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarUsuarios = async () => {
    try {
      const [p, a] = await Promise.all([
        api.get('/auth/pendientes'),
        api.get('/auth/trabajadores')
      ]);
      setPendientes(p.data);
      setAprobados(a.data);
    } catch (err) {
      console.error(err);
    }
    setCargando(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleAprobar = async (id) => {
    try {
      await api.put(`/auth/aprobar/${id}`, { aprobado: true });
      cargarUsuarios();
    } catch (err) {
      alert('Error al aprobar');
    }
  };

  const handleRechazar = async (id) => {
    if (confirm('¿Rechazar y eliminar este usuario?')) {
      try {
        await api.put(`/auth/aprobar/${id}`, { aprobado: false });
        cargarUsuarios();
      } catch (err) {
        alert('Error al rechazar');
      }
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h2>

        {/* Pendientes de aprobación */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
              {pendientes.length} pendientes
            </span>
            Trabajadores pendientes de aprobación
          </h3>

          {pendientes.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No hay usuarios pendientes de aprobación</p>
          ) : (
            <div className="grid gap-4">
              {pendientes.map(u => (
                <div key={u.id} className="flex justify-between items-center border rounded-lg p-4 bg-yellow-50">
                  <div>
                    <p className="font-semibold text-gray-800">{u.nombre}</p>
                    <p className="text-sm text-gray-500">{u.correo}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registrado: {new Date(u.creado_en).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAprobar(u.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => handleRechazar(u.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold">
                      ✗ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trabajadores aprobados */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold text-gray-700">Trabajadores activos</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Correo</th>
                <th className="p-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {aprobados.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.nombre}</td>
                  <td className="p-3 text-gray-500">{u.correo}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
              {aprobados.length === 0 && (
                <tr><td colSpan="3" className="p-6 text-center text-gray-400">No hay trabajadores activos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;