import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', empresa: '', estado: 'activo' });
  const [editando, setEditando] = useState(null);
  const [editandoEsUsuario, setEditandoEsUsuario] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const cargarClientes = async () => {
    const res = await api.get('/clientes');
    setClientes(res.data);
  };

  useEffect(() => { cargarClientes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        if (editandoEsUsuario) {
          await api.put(`/clientes/usuario/${editando}`, form);
        } else {
          await api.put(`/clientes/${editando}`, form);
        }
      } else {
        await api.post('/clientes', form);
      }
      setForm({ nombre: '', correo: '', telefono: '', empresa: '', estado: 'activo' });
      setEditando(null);
      setEditandoEsUsuario(false);
      setMostrarForm(false);
      cargarClientes();
    } catch (err) {
      alert('Error al guardar');
    }
  };

  const handleEditar = (cliente) => {
    setForm({
      nombre: cliente.nombre || '',
      correo: cliente.correo || '',
      telefono: cliente.telefono !== '-' ? cliente.telefono || '' : '',
      empresa: cliente.empresa !== 'Cliente registrado' ? cliente.empresa || '' : '',
      estado: cliente.estado || 'activo'
    });
    setEditando(cliente.id);
    setEditandoEsUsuario(cliente.es_usuario || false);
    setMostrarForm(true);
  };

  const handleEliminar = async (id, esUsuario) => {
    if (confirm('¿Eliminar este cliente?')) {
      if (!esUsuario) {
        await api.delete(`/clientes/${id}`);
      } else {
        alert('Este cliente tiene cuenta de usuario, elimínalo desde la base de datos.');
        return;
      }
      cargarClientes();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          {esAdmin && (
            <button
              onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setEditandoEsUsuario(false); setForm({ nombre: '', correo: '', telefono: '', empresa: '', estado: 'activo' }); }}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
              + Nuevo Cliente
            </button>
          )}
        </div>

        {esAdmin && mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="border rounded-lg px-4 py-2" />
            <input placeholder="Correo" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="border rounded-lg px-4 py-2" />
            <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="border rounded-lg px-4 py-2" />
            <input placeholder="Empresa" value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value})} className="border rounded-lg px-4 py-2" />
            <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="border rounded-lg px-4 py-2">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <button type="submit" className="bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800">
              {editando ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Correo</th>
                <th className="p-3 text-left">Teléfono</th>
                <th className="p-3 text-left">Empresa</th>
                <th className="p-3 text-left">Estado</th>
                {esAdmin && <th className="p-3 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {c.nombre}
                    {c.es_usuario && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Portal</span>}
                  </td>
                  <td className="p-3">{c.correo}</td>
                  <td className="p-3">{c.telefono}</td>
                  <td className="p-3">{c.empresa}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.estado}
                    </span>
                  </td>
                  {esAdmin && (
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEditar(c)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Editar</button>
                      {!c.es_usuario && (
                        <button onClick={() => handleEliminar(c.id, c.es_usuario)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No hay clientes registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;