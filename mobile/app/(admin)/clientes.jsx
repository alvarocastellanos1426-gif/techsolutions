import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', empresa: '', estado: 'activo' });

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    }
    setCargando(false);
  };

  useEffect(() => { cargarClientes(); }, []);

  const handleGuardar = async () => {
    if (!form.nombre) { Alert.alert('Error', 'El nombre es obligatorio'); return; }
    try {
      if (editando) {
        await api.put(`/clientes/${editando}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setForm({ nombre: '', correo: '', telefono: '', empresa: '', estado: 'activo' });
      setEditando(null);
      setMostrarForm(false);
      cargarClientes();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar');
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
    setMostrarForm(true);
  };

  const handleEliminar = (id) => {
    Alert.alert('Confirmar', '¿Eliminar este cliente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await api.delete(`/clientes/${id}`);
        cargarClientes();
      }}
    ]);
  };

  if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color="#1d4ed8" /></View>;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.botonNuevo} onPress={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', correo: '', telefono: '', empresa: '', estado: 'activo' }); }}>
        <Text style={styles.botonNuevoTexto}>+ Nuevo Cliente</Text>
      </TouchableOpacity>

      {mostrarForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Nombre *" value={form.nombre} onChangeText={v => setForm({...form, nombre: v})} />
          <TextInput style={styles.input} placeholder="Correo" value={form.correo} onChangeText={v => setForm({...form, correo: v})} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Teléfono" value={form.telefono} onChangeText={v => setForm({...form, telefono: v})} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Empresa" value={form.empresa} onChangeText={v => setForm({...form, empresa: v})} />
          <View style={styles.estadoRow}>
            <TouchableOpacity style={[styles.estadoBoton, form.estado === 'activo' && styles.estadoActivo]} onPress={() => setForm({...form, estado: 'activo'})}>
              <Text style={[styles.estadoTexto, form.estado === 'activo' && styles.estadoTextoActivo]}>Activo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.estadoBoton, form.estado === 'inactivo' && styles.estadoInactivo]} onPress={() => setForm({...form, estado: 'inactivo'})}>
              <Text style={[styles.estadoTexto, form.estado === 'inactivo' && styles.estadoTextoActivo]}>Inactivo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
            <Text style={styles.botonGuardarTexto}>{editando ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {clientes.map(c => (
        <View key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardNombre}>{c.nombre}</Text>
            <View style={[styles.badge, { backgroundColor: c.estado === 'activo' ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={[styles.badgeTexto, { color: c.estado === 'activo' ? '#16a34a' : '#dc2626' }]}>{c.estado}</Text>
            </View>
          </View>
          <Text style={styles.cardInfo}>{c.correo}</Text>
          <Text style={styles.cardInfo}>{c.telefono} · {c.empresa}</Text>
          {!c.es_usuario && (
            <View style={styles.acciones}>
              <TouchableOpacity style={styles.botonEditar} onPress={() => handleEditar(c)}>
                <Text style={styles.botonEditarTexto}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEliminar} onPress={() => handleEliminar(c.id)}>
                <Text style={styles.botonEliminarTexto}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  botonNuevo: { backgroundColor: '#1d4ed8', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  botonNuevoTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  estadoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  estadoBoton: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  estadoActivo: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  estadoInactivo: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  estadoTexto: { color: '#374151', fontWeight: '500' },
  estadoTextoActivo: { color: '#fff' },
  botonGuardar: { backgroundColor: '#1d4ed8', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botonGuardarTexto: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardInfo: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  acciones: { flexDirection: 'row', gap: 8, marginTop: 10 },
  botonEditar: { flex: 1, backgroundColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botonEditarTexto: { color: '#fff', fontWeight: '600' },
  botonEliminar: { flex: 1, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botonEliminarTexto: { color: '#fff', fontWeight: '600' },
});