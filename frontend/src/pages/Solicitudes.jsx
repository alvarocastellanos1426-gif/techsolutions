import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ estado: 'pendiente', proyecto_id: '' });

  const cargarDatos = async () => {
    const [s, p] = await Promise.all([api.get('/solicitudes'), api.get('/proyectos')]);
    setSolicitudes(s.data);
    setProyectos(p.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleEditar = (solicitud) => {
    setEditando(solicitud.id);
    setForm({ estado: solicitud.estado, proyecto_id: solicitud.proyecto_id || '' });
  };

  const handleGuardar = async (id) => {
    try {
      await api.put(`/solicitudes/${id}`, form);
      alert('Solicitud actualizada');
      setEditando(null);
      cargarDatos();
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const colorEstado = (estado) => {
    if (estado === 'aprobado') return 'bg-green-100 text-green-700';
    if (estado === 'rechazado') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Solicitudes de Proyectos</h2>
        <div className="grid gap-4">
          {solicitudes.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{s.titulo}</h3>
                  <p className="text-sm text-gray-500">Cliente: {s.usuarios?.nombre} — {s.usuarios?.correo}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(s.estado)}`}>
                  {s.estado}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{s.descripcion}</p>

              {editando === s.id ? (
                <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg">
                  <select
                    value={form.estado}
                    onChange={e => setForm({...form, estado: e.target.value})}
                    className="border rounded-lg px-4 py-2">
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobar</option>
                    <option value="rechazado">Rechazar</option>
                  </select>
                  {form.estado === 'aprobado' && (
                    <select
                      value={form.proyecto_id}
                      onChange={e => setForm({...form, proyecto_id: e.target.value})}
                      className="border rounded-lg px-4 py-2">
                      <option value="">Vincular a proyecto existente (opcional)</option>
                      {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleGuardar(s.id)} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
                      Guardar
                    </button>
                    <button onClick={() => setEditando(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleEditar(s)}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm">
                  Revisar solicitud
                </button>
              )}
            </div>
          ))}
          {solicitudes.length === 0 && (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              No hay solicitudes pendientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Solicitudes;