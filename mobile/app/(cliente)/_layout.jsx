import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ClienteLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#d97706',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: { paddingBottom: 5, height: 60 },
      headerStyle: { backgroundColor: '#d97706' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Tabs.Screen name="dashboard" options={{
        title: 'Mis Solicitudes',
        tabBarIcon: ({ color }) => <MaterialIcons name="inbox" size={24} color={color} />,
      }} />
    </Tabs>
  );
}