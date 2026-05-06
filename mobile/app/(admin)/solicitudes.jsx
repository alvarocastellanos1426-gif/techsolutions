import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../api';

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ estado: 'pendiente', proyecto_id: '' });

  const cargarDatos = async () => {
    try {
      const [s, p] = await Promise.all([api.get('/solicitudes'), api.get('/proyectos')]);
      setSolicitudes(s.data);
      setProyectos(p.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleGuardar = async (id) => {
    try {
      await api.put(`/solicitudes/${id}`, form);
      Alert.alert('Éxito', 'Solicitud actualizada');
      setEditando(null);
      cargarDatos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar');
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
            <Text style={styles.cardInfo}>Cliente: {s.usuarios?.nombre}</Text>
            <Text style={styles.cardInfo}>{s.usuarios?.correo}</Text>
            {s.descripcion ? <Text style={styles.cardDesc}>{s.descripcion}</Text> : null}

            {editando === s.id ? (
              <View style={styles.formInline}>
                <Text style={styles.selectLabel}>Decisión</Text>
                <View style={styles.row}>
                  {['pendiente', 'aprobado', 'rechazado'].map(e => (
                    <TouchableOpacity key={e} style={[styles.chipBoton, form.estado === e && styles.chipActivo]} onPress={() => setForm({...form, estado: e})}>
                      <Text style={[styles.chipTexto, form.estado === e && styles.chipTextoActivo]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {form.estado === 'aprobado' && (
                  <>
                    <Text style={styles.selectLabel}>Vincular proyecto (opcional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                      {proyectos.map(p => (
                        <TouchableOpacity key={p.id} style={[styles.chipBoton, form.proyecto_id === p.id && styles.chipActivo]}
                          onPress={() => setForm({...form, proyecto_id: p.id})}>
                          <Text style={[styles.chipTexto, form.proyecto_id === p.id && styles.chipTextoActivo]}>{p.nombre}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <View style={styles.acciones}>
                  <TouchableOpacity style={styles.botonGuardar} onPress={() => handleGuardar(s.id)}>
                    <Text style={styles.botonGuardarTexto}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botonCancelar} onPress={() => setEditando(null)}>
                    <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.botonRevisar} onPress={() => { setEditando(s.id); setForm({ estado: s.estado, proyecto_id: s.proyecto_id || '' }); }}>
                <Text style={styles.botonRevisarTexto}>Revisar solicitud</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      {solicitudes.length === 0 && (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No hay solicitudes pendientes</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardInfo: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  formInline: { marginTop: 12, backgroundColor: '#f9fafb', borderRadius: 10, padding: 12 },
  selectLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  chipBoton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  chipActivo: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  chipTexto: { color: '#374151', fontSize: 12 },
  chipTextoActivo: { color: '#fff' },
  acciones: { flexDirection: 'row', gap: 8 },
  botonGuardar: { flex: 1, backgroundColor: '#1d4ed8', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  botonGuardarTexto: { color: '#fff', fontWeight: '600' },
  botonCancelar: { flex: 1, backgroundColor: '#e5e7eb', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  botonCancelarTexto: { color: '#374151', fontWeight: '600' },
  botonRevisar: { marginTop: 10, backgroundColor: '#1d4ed8', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  botonRevisarTexto: { color: '#fff', fontWeight: '600' },
  vacio: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center' },
  vacioTexto: { color: '#9ca3af', fontSize: 14 },
});