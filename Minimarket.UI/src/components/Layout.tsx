import React from 'react';
import { Box } from '@mui/material';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const authUserString = localStorage.getItem('auth_user');
  const authUser = authUserString ? JSON.parse(authUserString) : null;
  const currentRole = authUser ? authUser.rol : 'Administrador';
  const roleLower = currentRole.toLowerCase();

  // Redirigir al POS si el rol es Cajero o Caja (bloquear acceso a administración)
  if (roleLower === 'cajero' || roleLower === 'caja') {
    return <Navigate to="/pos" replace />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 4
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
