import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Avatar, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['administrador', 'admin'] },
    { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/pos', roles: ['administrador', 'admin', 'cajero', 'caja', 'supervisor'] },
    { text: 'Ventas', icon: <ReceiptIcon />, path: '/ventas', roles: ['administrador', 'admin', 'supervisor'] },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario', roles: ['administrador', 'admin', 'supervisor'] },
    { text: 'Proveedores', icon: <LocalShippingIcon />, path: '/proveedores', roles: ['administrador', 'admin', 'supervisor'] },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios', roles: ['administrador', 'admin'] },
  ];

  const roleLower = currentRole.toLowerCase();
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(roleLower));

  return (
    <Box sx={{
      width: 260,
      background: '#FCFAF7',
      borderRight: '1px solid #EADEC9',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 3
    }}>
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#4A3E3D', letterSpacing: '1px' }}>
          MINI<span style={{ color: '#D97706' }}>MARKET</span>
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
                  background: active ? 'rgba(217, 119, 6, 0.12)' : 'transparent',
                  color: active ? '#B45309' : '#7A6F62',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(217, 119, 6, 0.05)',
                    color: '#B45309',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: active ? '#D97706' : '#8C7D70', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText>
                  <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '0.9rem' }}>
                    {item.text}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#EADEC9', my: 2 }} />

      {/* Tarjeta de Perfil de Usuario */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: getRoleColor(currentRole), width: 42, height: 42, fontWeight: 700, color: '#fff' }}>
            {currentName.charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography sx={{ color: '#4A3E3D', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#8A7B6E', fontSize: '0.75rem' }}>
              @{currentUsername} • <span style={{ color: getRoleColor(currentRole), fontWeight: 700 }}>{currentRole}</span>
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
            color: '#ef4444',
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
