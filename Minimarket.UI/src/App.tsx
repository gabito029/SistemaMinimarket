import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PosDashboard from './pages/POS/PosDashboard';
import InventoryDashboard from './pages/Inventario/InventoryDashboard';
import UsersDashboard from './pages/Usuarios/UsersDashboard';
import Login from './pages/Login';
import './index.css';

// Guard para asegurar que el usuario haya iniciado sesión
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authUser = localStorage.getItem('auth_user');
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública del Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas bajo el Layout de Administración */}
        <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="inventario" element={<InventoryDashboard />} />
          <Route path="usuarios" element={<UsersDashboard />} />
        </Route>
        
        {/* Ruta protegida para el terminal POS */}
        <Route path="/pos" element={<AuthGuard><PosDashboard /></AuthGuard>} />
        
        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
