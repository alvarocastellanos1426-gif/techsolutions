import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../api';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', responsable: '', prioridad: 'media', estado: 'pendiente', proyecto_id: '', usuario_id: '' });

  const cargarDatos = async () => {
    try {
      const [t, p, w] = await Promise.all([
        api.get('/tareas'),
        api.get('/proyectos'),
        api.get('/auth/trabajadores')
      ]);
      setTareas(t.data);
      setProyectos(p.data);
      setTrabajadores(w.data);
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
        await api.put(`/tareas/${editando}`, form);
      } else {
        await api.post('/tareas', form);
      }
      setForm({ nombre: '', responsable: '', prioridad: 'media', estado: 'pendiente', proyecto_id: '', usuario_id: '' });
      setEditando(null);
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  const handleEditar = (tarea) => {
    setForm({
      nombre: tarea.nombre || '',
      responsable: tarea.responsable || '',
      prioridad: tarea.prioridad || 'media',
      estado: tarea.estado || 'pendiente',
      proyecto_id: tarea.proyecto_id || '',
      usuario_id: tarea.usuario_id || ''
    });
    setEditando(tarea.id);
    setMostrarForm(true);
  };

  const handleEliminar = (id) => {
    Alert.alert('Confirmar', '¿Eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await api.delete(`/tareas/${id}`);
        cargarDatos();
      }}
    ]);
  };

  const colorPrioridad = (p) => {
    if (p === 'alta') return { bg: '#fee2e2', text: '#dc2626' };
    if (p === 'media') return { bg: '#fef9c3', text: '#ca8a04' };
    return { bg: '#dcfce7', text: '#16a34a' };
  };

  const colorEstado = (e) => {
    if (e === 'completado') return { bg: '#dcfce7', text: '#16a34a' };
    if (e === 'en progreso') return { bg: '#fef9c3', text: '#ca8a04' };
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color="#7c3aed" /></View>;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.botonNuevo} onPress={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', responsable: '', prioridad: 'media', estado: 'pendiente', proyecto_id: '', usuario_id: '' }); }}>
        <Text style={styles.botonNuevoTexto}>+ Nueva Tarea</Text>
      </TouchableOpacity>

      {mostrarForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Nombre de la tarea *" value={form.nombre} onChangeText={v => setForm({...form, nombre: v})} />

          <Text style={styles.selectLabel}>Trabajador</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {trabajadores.map(t => (
              <TouchableOpacity key={t.id} style={[styles.chipBoton, form.usuario_id === t.id && styles.chipActivo]}
                onPress={() => setForm({...form, usuario_id: t.id, responsable: t.nombre})}>
                <Text style={[styles.chipTexto, form.usuario_id === t.id && styles.chipTextoActivo]}>{t.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.selectLabel}>Proyecto</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {proyectos.map(p => (
              <TouchableOpacity key={p.id} style={[styles.chipBoton, form.proyecto_id === p.id && styles.chipActivo]}
                onPress={() => setForm({...form, proyecto_id: p.id})}>
                <Text style={[styles.chipTexto, form.proyecto_id === p.id && styles.chipTextoActivo]}>{p.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.selectLabel}>Prioridad</Text>
          <View style={styles.row}>
            {['alta', 'media', 'baja'].map(p => (
              <TouchableOpacity key={p} style={[styles.chipBoton, form.prioridad === p && styles.chipActivo]} onPress={() => setForm({...form, prioridad: p})}>
                <Text style={[styles.chipTexto, form.prioridad === p && styles.chipTextoActivo]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectLabel}>Estado</Text>
          <View style={styles.row}>
            {['pendiente', 'en progreso', 'completado'].map(e => (
              <TouchableOpacity key={e} style={[styles.chipBoton, form.estado === e && styles.chipActivo]} onPress={() => setForm({...form, estado: e})}>
                <Text style={[styles.chipTexto, form.estado === e && styles.chipTextoActivo]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
            <Text style={styles.botonGuardarTexto}>{editando ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {tareas.map(t => {
        const cp = colorPrioridad(t.prioridad);
        const ce = colorEstado(t.estado);
        return (
          <View key={t.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNombre}>{t.nombre}</Text>
              <View style={[styles.badge, { backgroundColor: cp.bg }]}>
                <Text style={[styles.badgeTexto, { color: cp.text }]}>{t.prioridad}</Text>
              </View>
            </View>
            <Text style={styles.cardInfo}>Responsable: {t.responsable || '-'}</Text>
            <Text style={styles.cardInfo}>Proyecto: {t.proyectos?.nombre || '-'}</Text>
            <View style={[styles.badge, { backgroundColor: ce.bg, alignSelf: 'flex-start', marginTop: 6 }]}>
              <Text style={[styles.badgeTexto, { color: ce.text }]}>{t.estado}</Text>
            </View>
            <View style={styles.acciones}>
              <TouchableOpacity style={styles.botonEditar} onPress={() => handleEditar(t)}>
                <Text style={styles.botonEditarTexto}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEliminar} onPress={() => handleEliminar(t.id)}>
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
  botonNuevo: { backgroundColor: '#7c3aed', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  botonNuevoTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  selectLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  scroll: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  chipBoton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 6 },
  chipActivo: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipTexto: { color: '#374151', fontSize: 13 },
  chipTextoActivo: { color: '#fff' },
  botonGuardar: { backgroundColor: '#7c3aed', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botonGuardarTexto: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardInfo: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  acciones: { flexDirection: 'row', gap: 8, marginTop: 10 },
  botonEditar: { flex: 1, backgroundColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botonEditarTexto: { color: '#fff', fontWeight: '600' },
  botonEliminar: { flex: 1, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botonEliminarTexto: { color: '#fff', fontWeight: '600' },
});