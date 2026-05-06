import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../api';

export default function ClienteDashboard() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '' });

  const cargarSolicitudes = async () => {
    try {
      const res = await api.get('/solicitudes');
      setSolicitudes(res.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    }
    setCargando(false);
  };

  useEffect(() => { cargarSolicitudes(); }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleEnviar = async () => {
    if (!form.titulo) { Alert.alert('Error', 'El título es obligatorio'); return; }
    try {
      await api.post('/solicitudes', form);
      Alert.alert('Éxito', 'Solicitud enviada correctamente');
      setForm({ titulo: '', descripcion: '' });
      setMostrarForm(false);
      cargarSolicitudes();
    } catch (err) {
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  const colorEstado = (estado) => {
    if (estado === 'aprobado') return { bg: '#dcfce7', text: '#16a34a' };
    if (estado === 'rechazado') return { bg: '#fee2e2', text: '#dc2626' };
    return { bg: '#fef9c3', text: '#ca8a04' };
  };

  if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color="#d97706" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.bienvenida}>Hola, {usuario?.nombre} 👋</Text>
          <Text style={styles.subtitulo}>Portal de Cliente</Text>
        </View>
        <TouchableOpacity style={styles.botonSalir} onPress={handleLogout}>
          <Text style={styles.botonSalirTexto}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.botonNuevo} onPress={() => setMostrarForm(!mostrarForm)}>
          <Text style={styles.botonNuevoTexto}>+ Nueva Solicitud</Text>
        </TouchableOpacity>

        {mostrarForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Título del proyecto *"
              value={form.titulo}
              onChangeText={v => setForm({...form, titulo: v})}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descripción del proyecto"
              value={form.descripcion}
              onChangeText={v => setForm({...form, descripcion: v})}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.botonEnviar} onPress={handleEnviar}>
              <Text style={styles.botonEnviarTexto}>Enviar solicitud</Text>
            </TouchableOpacity>
          </View>
        )}

        {solicitudes.map(s => {
          const c = colorEstado(s.estado);
          return (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNombre}>{s.titulo}</Text>
                <View style={[styles.badge, { backgroundColor: c.bg }]}>
                  <Text style={[styles.badgeTexto, { color: c.text }]}>{s.estado}</Text>
                </View>
              </View>
              {s.descripcion ? <Text style={styles.cardDesc}>{s.descripcion}</Text> : null}
              {s.estado === 'aprobado' && (
                <View style={styles.aprobadoBox}>
                  <Text style={styles.aprobadoTexto}>✅ Tu proyecto fue aprobado y está en desarrollo</Text>
                </View>
              )}
              {s.estado === 'rechazado' && (
                <View style={styles.rechazadoBox}>
                  <Text style={styles.rechazadoTexto}>❌ Tu solicitud fue rechazada. Puedes enviar una nueva.</Text>
                </View>
              )}
              {s.estado === 'pendiente' && (
                <View style={styles.pendienteBox}>
                  <Text style={styles.pendienteTexto}>⏳ Tu solicitud está siendo revisada</Text>
                </View>
              )}
            </View>
          );
        })}

        {solicitudes.length === 0 && (
          <View style={styles.vacio}>
            <Text style={styles.vacioTexto}>No tienes solicitudes aún. ¡Crea una nueva!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#d97706', padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bienvenida: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subtitulo: { fontSize: 13, color: '#fef3c7', marginTop: 2 },
  botonSalir: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  botonSalirTexto: { color: '#d97706', fontWeight: '600' },
  content: { padding: 16 },
  botonNuevo: { backgroundColor: '#d97706', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  botonNuevoTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },
  botonEnviar: { backgroundColor: '#d97706', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botonEnviarTexto: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardDesc: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  aprobadoBox: { backgroundColor: '#dcfce7', borderRadius: 8, padding: 10, marginTop: 6 },
  aprobadoTexto: { color: '#16a34a', fontSize: 13 },
  rechazadoBox: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, marginTop: 6 },
  rechazadoTexto: { color: '#dc2626', fontSize: 13 },
  pendienteBox: { backgroundColor: '#fef9c3', borderRadius: 8, padding: 10, marginTop: 6 },
  pendienteTexto: { color: '#ca8a04', fontSize: 13 },
  vacio: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center' },
  vacioTexto: { color: '#9ca3af', fontSize: 14, textAlign: 'center' },
});