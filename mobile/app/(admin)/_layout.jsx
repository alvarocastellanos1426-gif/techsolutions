import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1d4ed8',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: { paddingBottom: 5, height: 60 },
      headerStyle: { backgroundColor: '#1d4ed8' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Tabs.Screen name="dashboard" options={{
        title: 'Inicio',
        tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
      }} />
      <Tabs.Screen name="clientes" options={{
        title: 'Clientes',
        tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
      }} />
      <Tabs.Screen name="proyectos" options={{
        title: 'Proyectos',
        tabBarIcon: ({ color }) => <MaterialIcons name="folder" size={24} color={color} />,
      }} />
      <Tabs.Screen name="tareas" options={{
        title: 'Tareas',
        tabBarIcon: ({ color }) => <MaterialIcons name="task" size={24} color={color} />,
      }} />
      <Tabs.Screen name="solicitudes" options={{
        title: 'Solicitudes',
        tabBarIcon: ({ color }) => <MaterialIcons name="inbox" size={24} color={color} />,
      }} />
    </Tabs>
  );
}