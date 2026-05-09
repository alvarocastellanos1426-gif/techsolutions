import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Proyectos from './pages/Proyectos';
import Tareas from './pages/Tareas';
import Solicitudes from './pages/Solicitudes';
import GraficasTareas from './pages/GraficasTareas';
import ClienteDashboard from './pages/ClienteDashboard';
import ClienteProyecto from './pages/ClienteProyecto';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin','trabajador']}><Dashboard /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute roles={['admin','trabajador']}><Clientes /></ProtectedRoute>} />
          <Route path="/proyectos" element={<ProtectedRoute roles={['admin','trabajador']}><Proyectos /></ProtectedRoute>} />
          <Route path="/tareas" element={<ProtectedRoute roles={['admin','trabajador']}><Tareas /></ProtectedRoute>} />
          <Route path="/solicitudes" element={<ProtectedRoute roles={['admin']}><Solicitudes /></ProtectedRoute>} />
          <Route path="/graficas" element={<ProtectedRoute roles={['admin']}><GraficasTareas /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute roles={['cliente']}><ClienteDashboard /></ProtectedRoute>} />
          <Route path="/cliente/proyecto/:id" element={<ProtectedRoute roles={['cliente']}><ClienteProyecto /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/reportes" element={<ProtectedRoute roles={['admin','trabajador']}><Reportes /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute roles={['admin']}><Usuarios /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;