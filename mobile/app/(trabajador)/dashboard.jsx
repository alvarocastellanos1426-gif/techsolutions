import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../api';

export default function TrabajadorDashboard() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarTareas = async () => {
    try {
      const res = await api.get('/tareas');
      const misTareas = res.data.filter(t => t.usuario_id === usuario.id);
      setTareas(misTareas);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    }
    setCargando(false);
  };

  useEffect(() => { cargarTareas(); }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const actualizarEstado = async (tarea, nuevoEstado) => {
    try {
      await api.put(`/tareas/${tarea.id}`, { ...tarea, estado: nuevoEstado });
      cargarTareas();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar');
    }
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
      <View style={styles.header}>
        <View>
          <Text style={styles.bienvenida}>Hola, {usuario?.nombre} 👋</Text>
          <Text style={styles.subtitulo}>{tareas.length} tareas asignadas</Text>
        </View>
        <TouchableOpacity style={styles.botonSalir} onPress={handleLogout}>
          <Text style={styles.botonSalirTexto}>Salir</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.cardInfo}>Proyecto: {t.proyectos?.nombre || '-'}</Text>
            <View style={[styles.badge, { backgroundColor: ce.bg, alignSelf: 'flex-start', marginTop: 6, marginBottom: 10 }]}>
              <Text style={[styles.badgeTexto, { color: ce.text }]}>{t.estado}</Text>
            </View>

            <Text style={styles.selectLabel}>Actualizar estado:</Text>
            <View style={styles.row}>
              {['pendiente', 'en progreso', 'completado'].map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chipBoton, t.estado === e && styles.chipActivo]}
                  onPress={() => actualizarEstado(t, e)}>
                  <Text style={[styles.chipTexto, t.estado === e && styles.chipTextoActivo]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      {tareas.length === 0 && (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No tienes tareas asignadas</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#7c3aed', padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bienvenida: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subtitulo: { fontSize: 13, color: '#ddd6fe', marginTop: 2 },
  botonSalir: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  botonSalirTexto: { color: '#7c3aed', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 16, marginBottom: 0, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardInfo: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  selectLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipBoton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActivo: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipTexto: { color: '#374151', fontSize: 12 },
  chipTextoActivo: { color: '#fff' },
  vacio: { backgroundColor: '#fff', borderRadius: 12, padding: 32, margin: 16, alignItems: 'center' },
  vacioTexto: { color: '#9ca3af', fontSize: 14 },
});