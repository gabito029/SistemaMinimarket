import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Avatar, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos del usuario logueado
  const authUserString = localStorage.getItem('auth_user');
  const authUser = authUserString ? JSON.parse(authUserString) : null;
  
  const currentRole = authUser ? authUser.rol : 'Administrador';
  const currentName = authUser ? authUser.nombre : 'Usuario';
  const currentUsername = authUser ? authUser.username : 'admin';

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_role');
    navigate('/login');
    window.location.reload();
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'Administrador': return '#8b5cf6'; // Violeta
      case 'Cajero': return '#3b82f6'; // Azul
      case 'Supervisor': return '#f59e0b'; // Naranja
      default: return '#94a3b8';
    }
  };

  const menuItems = [
    { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/pos', roles: ['administrador', 'admin', 'cajero', 'caja', 'supervisor'] },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario', roles: ['administrador', 'admin', 'supervisor'] },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios', roles: ['administrador', 'admin'] },
  ];

  const roleLower = currentRole.toLowerCase();
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(roleLower));

  return (
    <Box sx={{
      width: 260,
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 3
    }}>
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
          MINI<span style={{ color: '#3b82f6' }}>MARKET</span>
        </Typography>
      </Box>

      {/* Listado de Menús */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {visibleMenuItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '12px',
                  background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: active ? '#60a5fa' : '#94a3b8',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText>
                  <Typography sx={{ fontWeight: active ? 600 : 500, fontSize: '0.9rem' }}>
                    {item.text}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 2 }} />

      {/* Tarjeta de Perfil de Usuario */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: getRoleColor(currentRole), width: 42, height: 42, fontWeight: 700 }}>
            {currentName.charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              @{currentUsername} • <span style={{ color: getRoleColor(currentRole), fontWeight: 600 }}>{currentRole}</span>
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          color="error" 
          fullWidth
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: '10px', 
            textTransform: 'none', 
            fontWeight: 600, 
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            '&:hover': {
              borderColor: '#ef4444',
              background: 'rgba(239, 68, 68, 0.08)'
            }
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
