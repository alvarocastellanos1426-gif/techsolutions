import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../api';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmar: '', rol: 'trabajador' });
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleRegistro = async () => {
    if (!form.nombre || !form.correo || !form.password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (form.password !== form.confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setCargando(true);
    try {
      await api.post('/auth/registro', form);
      Alert.alert('Éxito', 'Cuenta creada correctamente', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err) {
      Alert.alert('Error', 'El correo ya está en uso');
    }
    setCargando(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.titulo}>TechSolutions</Text>
        <Text style={styles.subtitulo}>Crear nueva cuenta</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          value={form.nombre}
          onChangeText={v => setForm({...form, nombre: v})}
        />

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="juan@empresa.com"
          value={form.correo}
          onChangeText={v => setForm({...form, correo: v})}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={form.password}
          onChangeText={v => setForm({...form, password: v})}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={form.confirmar}
          onChangeText={v => setForm({...form, confirmar: v})}
          secureTextEntry
        />

        <Text style={styles.label}>Tipo de cuenta</Text>
        <View style={styles.roles}>
          <TouchableOpacity
            style={[styles.rolBoton, form.rol === 'trabajador' && styles.rolActivo]}
            onPress={() => setForm({...form, rol: 'trabajador'})}>
            <Text style={[styles.rolTexto, form.rol === 'trabajador' && styles.rolTextoActivo]}>Trabajador</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rolBoton, form.rol === 'cliente' && styles.rolActivo]}
            onPress={() => setForm({...form, rol: 'cliente'})}>
            <Text style={[styles.rolTexto, form.rol === 'cliente' && styles.rolTextoActivo]}>Cliente</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.boton} onPress={handleRegistro} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  content: { padding: 24, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 5 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 14 },
  roles: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  rolBoton: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  rolActivo: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  rolTexto: { color: '#374151', fontWeight: '500' },
  rolTextoActivo: { color: '#fff' },
  boton: { backgroundColor: '#1d4ed8', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  botonTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: '#1d4ed8', textAlign: 'center', fontSize: 14 },
});