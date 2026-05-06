import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TrabajadorLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#7c3aed',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: { paddingBottom: 5, height: 60 },
      headerStyle: { backgroundColor: '#7c3aed' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Tabs.Screen name="dashboard" options={{
        title: 'Mis Tareas',
        tabBarIcon: ({ color }) => <MaterialIcons name="task" size={24} color={color} />,
      }} />
    </Tabs>
  );
}