import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../api';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', cliente_id: '' });

  const cargarDatos = async () => {
    try {
      const [p, c] = await Promise.all([api.get('/proyectos'), api.get('/clientes')]);
      setProyectos(p.data);
      setClientes(c.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleGuardar = async () => {
    if (!form.nombre) { Alert.alert('Error', 'El nombre es obligatorio'); return; }
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
      Alert.alert('Error', 'No se pudo guardar');
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

  const handleEliminar = (id) => {
    Alert.alert('Confirmar', '¿Eliminar este proyecto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await api.delete(`/proyectos/${id}`);
        cargarDatos();
      }}
    ]);
  };

  const colorEstado = (estado) => {
    if (estado === 'completado') return { bg: '#dcfce7', text: '#16a34a' };
    if (estado === 'en progreso') return { bg: '#fef9c3', text: '#ca8a04' };
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /></View>;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.botonNuevo} onPress={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', cliente_id: '' }); }}>
        <Text style={styles.botonNuevoTexto}>+ Nuevo Proyecto</Text>
      </TouchableOpacity>

      {mostrarForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Nombre del proyecto *" value={form.nombre} onChangeText={v => setForm({...form, nombre: v})} />
          <TextInput style={styles.input} placeholder="Descripción" value={form.descripcion} onChangeText={v => setForm({...form, descripcion: v})} multiline />
          <TextInput style={styles.input} placeholder="Fecha inicio (YYYY-MM-DD)" value={form.fecha_inicio} onChangeText={v => setForm({...form, fecha_inicio: v})} />
          <TextInput style={styles.input} placeholder="Fecha fin (YYYY-MM-DD)" value={form.fecha_fin} onChangeText={v => setForm({...form, fecha_fin: v})} />

          <Text style={styles.selectLabel}>Estado</Text>
          <View style={styles.estadoRow}>
            {['pendiente', 'en progreso', 'completado'].map(e => (
              <TouchableOpacity key={e} style={[styles.estadoBoton, form.estado === e && styles.estadoActivo]} onPress={() => setForm({...form, estado: e})}>
                <Text style={[styles.estadoTexto, form.estado === e && styles.estadoTextoActivo]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectLabel}>Cliente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientesScroll}>
            {clientes.map(c => (
              <TouchableOpacity key={c.id} style={[styles.clienteBoton, form.cliente_id === c.id && styles.clienteActivo]} onPress={() => setForm({...form, cliente_id: c.id})}>
                <Text style={[styles.clienteTexto, form.cliente_id === c.id && styles.clienteTextoActivo]}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
            <Text style={styles.botonGuardarTexto}>{editando ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {proyectos.map(p => {
        const c = colorEstado(p.estado);
        return (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNombre}>{p.nombre}</Text>
              <View style={[styles.badge, { backgroundColor: c.bg }]}>
                <Text style={[styles.badgeTexto, { color: c.text }]}>{p.estado}</Text>
              </View>
            </View>
            <Text style={styles.cardInfo}>Cliente: {p.clientes?.nombre || '-'}</Text>
            <Text style={styles.cardInfo}>Inicio: {p.fecha_inicio || '-'} · Fin: {p.fecha_fin || '-'}</Text>
            {p.descripcion ? <Text style={styles.cardDesc}>{p.descripcion}</Text> : null}
            <View style={styles.acciones}>
              <TouchableOpacity style={styles.botonEditar} onPress={() => handleEditar(p)}>
                <Text style={styles.botonEditarTexto}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEliminar} onPress={() => handleEliminar(p.id)}>
                <Text style={styles.botonEliminarTexto}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  botonNuevo: { backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  botonNuevoTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  selectLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  estadoRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  estadoBoton: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  estadoActivo: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  estadoTexto: { color: '#374151', fontSize: 11, fontWeight: '500' },
  estadoTextoActivo: { color: '#fff' },
  clientesScroll: { marginBottom: 12 },
  clienteBoton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  clienteActivo: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  clienteTexto: { color: '#374151', fontSize: 13 },
  clienteTextoActivo: { color: '#fff' },
  botonGuardar: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botonGuardarTexto: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardInfo: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  acciones: { flexDirection: 'row', gap: 8, marginTop: 10 },
  botonEditar: { flex: 1, backgroundColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botonEditarTexto: { color: '#fff', fontWeight: '600' },
  botonEliminar: { flex: 1, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botonEliminarTexto: { color: '#fff', fontWeight: '600' },
});