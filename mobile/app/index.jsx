import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/(auth)/login');
    } else if (usuario.rol === 'admin') {
      router.replace('/(admin)/dashboard');
    } else if (usuario.rol === 'trabajador') {
      router.replace('/(trabajador)/dashboard');
    } else if (usuario.rol === 'cliente') {
      router.replace('/(cliente)/dashboard');
    }
  }, [usuario, cargando]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#1d4ed8" />
    </View>
  );
}