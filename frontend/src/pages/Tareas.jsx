import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', responsable: '', prioridad: 'media', estado: 'pendiente', proyecto_id: '', usuario_id: '' });
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const cargarDatos = async () => {
    const [t, p] = await Promise.all([api.get('/tareas'), api.get('/proyectos')]);
    const todasTareas = t.data;
    // Usuarios solo ven sus tareas asignadas
    const tareasFiltradas = esAdmin
      ? todasTareas
      : todasTareas.filter(t => t.usuario_id === usuario.id);
    setTareas(tareasFiltradas);
    setProyectos(p.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editando) {
      await api.put(`/tareas/${editando}`, form);
    } else {
      await api.post('/tareas', form);
    }
    setForm({ nombre: '', responsable: '', prioridad: 'media', estado: 'pendiente', proyecto_id: '', usuario_id: '' });
    setEditando(null);
    setMostrarForm(false);
    cargarDatos();
  };

  const handleEditar = (tarea) => {
    setForm(tarea);
    setEditando(tarea.id);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar esta tarea?')) {
      await api.delete(`/tareas/${id}`);
      cargarDatos();
    }
  };

  const colorPrioridad = (prioridad) => {
    if (prioridad === 'alta') return 'bg-red-100 text-red-700';
    if (prioridad === 'media') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const colorEstado = (estado) => {
    if (estado === 'completado') return 'bg-green-100 text-green-700';
    if (estado === 'en progreso') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tareas</h2>
          {esAdmin && (
            <button
              onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', responsable: '', prioridad: 'media', estado: 'pendiente', proyecto_id: '', usuario_id: '' }); }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              + Nueva Tarea
            </button>
          )}
        </div>

        {!esAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-blue-700 text-sm">
            Estás viendo las tareas asignadas a ti.
          </div>
        )}

        {esAdmin && mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre de la tarea" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="border rounded-lg px-4 py-2" />
            <input placeholder="Responsable" value={form.responsable} onChange={e => setForm({...form, responsable: e.target.value})} className="border rounded-lg px-4 py-2" />
            <select value={form.proyecto_id} onChange={e => setForm({...form, proyecto_id: e.target.value})} className="border rounded-lg px-4 py-2">
              <option value="">Seleccionar proyecto</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})} className="border rounded-lg px-4 py-2">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="border rounded-lg px-4 py-2">
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
            <input placeholder="ID del usuario asignado (opcional)" value={form.usuario_id} onChange={e => setForm({...form, usuario_id: e.target.value})} className="border rounded-lg px-4 py-2" />
            <button type="submit" className="bg-purple-600 text-white rounded-lg py-2 hover:bg-purple-700 md:col-span-2">
              {editando ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-3 text-left">Tarea</th>
                <th className="p-3 text-left">Responsable</th>
                <th className="p-3 text-left">Proyecto</th>
                <th className="p-3 text-left">Prioridad</th>
                <th className="p-3 text-left">Estado</th>
                {esAdmin && <th className="p-3 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {tareas.map(t => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{t.nombre}</td>
                  <td className="p-3">{t.responsable}</td>
                  <td className="p-3">{t.proyectos?.nombre || '-'}</td>
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
                  {esAdmin && (
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEditar(t)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Editar</button>
                      <button onClick={() => handleEliminar(t.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
              {tareas.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No hay tareas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tareas;