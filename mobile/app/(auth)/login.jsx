import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const res = await api.post('/auth/login', { correo, password });
      await login(res.data.token, res.data.usuario);
      const rol = res.data.usuario.rol;
      if (rol === 'admin') router.replace('/(admin)/dashboard');
      else if (rol === 'trabajador') router.replace('/(trabajador)/dashboard');
      else router.replace('/(cliente)/dashboard');
    } catch (err) {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    }
    setCargando(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>TechSolutions</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@techsolutions.com"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.boton} onPress={handleLogin} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Iniciar sesión</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/registro')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 14 },
  boton: { backgroundColor: '#1d4ed8', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  botonTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: '#1d4ed8', textAlign: 'center', fontSize: 14 },
});