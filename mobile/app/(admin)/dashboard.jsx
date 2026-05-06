import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.bienvenida}>Bienvenido, {usuario?.nombre} 👋</Text>
        <Text style={styles.subtitulo}>Panel de control — Administrador</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={[styles.card, { borderLeftColor: '#1d4ed8' }]} onPress={() => router.push('/(admin)/clientes')}>
          <Text style={styles.cardTitulo}>Clientes</Text>
          <Text style={styles.cardDesc}>Gestión de clientes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderLeftColor: '#16a34a' }]} onPress={() => router.push('/(admin)/proyectos')}>
          <Text style={styles.cardTitulo}>Proyectos</Text>
          <Text style={styles.cardDesc}>Gestión de proyectos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderLeftColor: '#7c3aed' }]} onPress={() => router.push('/(admin)/tareas')}>
          <Text style={styles.cardTitulo}>Tareas</Text>
          <Text style={styles.cardDesc}>Seguimiento de tareas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderLeftColor: '#d97706' }]} onPress={() => router.push('/(admin)/solicitudes')}>
          <Text style={styles.cardTitulo}>Solicitudes</Text>
          <Text style={styles.cardDesc}>Solicitudes de proyectos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botonSalir} onPress={handleLogout}>
        <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#1d4ed8', padding: 24, paddingTop: 16 },
  bienvenida: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitulo: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
  grid: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderLeftWidth: 4, elevation: 2 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  botonSalir: { margin: 16, backgroundColor: '#ef4444', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  botonSalirTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
});