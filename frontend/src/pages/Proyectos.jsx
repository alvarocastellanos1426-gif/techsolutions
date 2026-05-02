import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', cliente_id: '' });
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const cargarDatos = async () => {
    const [p, c] = await Promise.all([api.get('/proyectos'), api.get('/clientes')]);
    setProyectos(p.data);
    setClientes(c.data);
  };

  useEffect(() => { cargarDatos(); }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editando) {
      await api.put(`/proyectos/${editando}`, form);
    } else {
      await api.post('/proyectos', form);
    }
    setForm({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', cliente_id: '' });
    setEditando(null);
    setMostrarForm(false);
    cargarDatos();
  } catch (err) {
    alert('Error al guardar el proyecto');
  }
};

  const handleEditar = (proyecto) => {
  setForm({
    nombre: proyecto.nombre || '',
    descripcion: proyecto.descripcion || '',
    fecha_inicio: proyecto.fecha_inicio || '',
    fecha_fin: proyecto.fecha_fin || '',
    estado: proyecto.estado || 'pendiente',
    cliente_id: proyecto.cliente_id || ''
  });
  setEditando(proyecto.id);
  setMostrarForm(true);
};

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este proyecto?')) {
      await api.delete(`/proyectos/${id}`);
      cargarDatos();
    }
  };

  const colorEstado = (estado) => {
    if (estado === 'completado') return 'bg-green-100 text-green-700';
    if (estado === 'en progreso') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Usuarios solo ven proyectos donde tienen tareas asignadas
  const proyectosFiltrados = esAdmin
    ? proyectos
    : proyectos.filter(p => p.tieneAsignacion);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Proyectos</h2>
          {esAdmin && (
            <button
              onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', cliente_id: '' }); }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + Nuevo Proyecto
            </button>
          )}
        </div>

        {!esAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-blue-700 text-sm">
            Estás viendo los proyectos donde tienes tareas asignadas.
          </div>
        )}

        {esAdmin && mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre del proyecto" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="border rounded-lg px-4 py-2" />
            <select value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})} className="border rounded-lg px-4 py-2">
              <option value="">Seleccionar cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="border rounded-lg px-4 py-2 md:col-span-2" />
            <input type="date" value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})} className="border rounded-lg px-4 py-2" />
            <input type="date" value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})} className="border rounded-lg px-4 py-2" />
            <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="border rounded-lg px-4 py-2">
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
            <button type="submit" className="bg-green-600 text-white rounded-lg py-2 hover:bg-green-700">
              {editando ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Fecha inicio</th>
                <th className="p-3 text-left">Fecha fin</th>
                <th className="p-3 text-left">Estado</th>
                {esAdmin && <th className="p-3 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {proyectos.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.nombre}</td>
                  <td className="p-3">{p.clientes?.nombre || '-'}</td>
                  <td className="p-3">{p.fecha_inicio || '-'}</td>
                  <td className="p-3">{p.fecha_fin || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstado(p.estado)}`}>
                      {p.estado}
                    </span>
                  </td>
                  {esAdmin && (
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEditar(p)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Editar</button>
                      <button onClick={() => handleEliminar(p.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
              {proyectos.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No hay proyectos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Proyectos;