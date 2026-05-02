import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const ClienteDashboard = () => {
  const { usuario, logout } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [form, setForm] = useState({ titulo: '', descripcion: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const navigate = useNavigate();

  const cargarSolicitudes = async () => {
    const res = await api.get('/solicitudes');
    setSolicitudes(res.data);
  };

  useEffect(() => { cargarSolicitudes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/solicitudes', form);
      alert('Solicitud enviada correctamente');
      setForm({ titulo: '', descripcion: '' });
      setMostrarForm(false);
      cargarSolicitudes();
    } catch (err) {
      alert('Error al enviar la solicitud');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const colorEstado = (estado) => {
    if (estado === 'aprobado') return 'bg-green-100 text-green-700';
    if (estado === 'rechazado') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-xl font-bold">TechSolutions — Portal Cliente</span>
        <div className="flex gap-4 items-center">
          <span className="text-sm opacity-80">Hola, {usuario?.nombre}</span>
          <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded font-semibold hover:bg-blue-100">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis solicitudes de proyecto</h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
            + Nueva solicitud
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col gap-4">
            <input
              required
              placeholder="Título del proyecto"
              value={form.titulo}
              onChange={e => setForm({...form, titulo: e.target.value})}
              className="border rounded-lg px-4 py-2"
            />
            <textarea
              placeholder="Descripción del proyecto que necesitas"
              value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
              className="border rounded-lg px-4 py-2 h-24"
            />
            <button type="submit" className="bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800">
              Enviar solicitud
            </button>
          </form>
        )}

        <div className="grid gap-4">
          {solicitudes.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">{s.titulo}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(s.estado)}`}>
                  {s.estado}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-3">{s.descripcion}</p>
              {s.estado === 'aprobado' && s.proyecto_id && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  ✅ Tu proyecto fue aprobado y está en desarrollo.
                  <button
                    onClick={() => navigate(`/cliente/proyecto/${s.proyecto_id}`)}
                    className="ml-2 underline font-semibold">
                    Ver avance
                  </button>
                </div>
              )}
              {s.estado === 'rechazado' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  ❌ Tu solicitud fue rechazada. Puedes enviar una nueva.
                </div>
              )}
              {s.estado === 'pendiente' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                  ⏳ Tu solicitud está siendo revisada por el administrador.
                </div>
              )}
            </div>
          ))}
          {solicitudes.length === 0 && (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              No tienes solicitudes aún. ¡Crea una nueva!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;