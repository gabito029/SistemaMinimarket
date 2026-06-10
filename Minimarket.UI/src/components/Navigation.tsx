import { Box, Typography, Button, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos del usuario logueado
  const authUserString = localStorage.getItem('auth_user');
  const authUser = authUserString ? JSON.parse(authUserString) : null;
  
  const currentRole = authUser ? authUser.rol : 'Administrador';
  const currentName = authUser ? authUser.nombre : 'Usuario';

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

  const getBtnStyle = (path: string) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? '#FFFFFF' : '#7A6F62',
      background: isActive ? '#D97706' : 'transparent',
      fontWeight: isActive ? 750 : 500,
      px: 2.5,
      py: 1,
      borderRadius: '10px',
      textTransform: 'none',
      boxShadow: isActive ? '0 4px 6px -1px rgba(217, 119, 6, 0.3)' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: isActive ? '#B45309' : 'rgba(217, 119, 6, 0.08)',
        color: isActive ? '#FFFFFF' : '#D97706',
        transform: isActive ? 'none' : 'translateY(-1px)'
      }
    };
  };

  const isAdminOrSupervisor = currentRole.toLowerCase() === 'administrador' || currentRole.toLowerCase() === 'admin' || currentRole.toLowerCase() === 'supervisor';

  return (
    <Box 
      sx={{ 
        p: 2, 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#fff',
        border: '1px solid #eadec9',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mr: 4, color: '#4A3E3D' }}>
          MINI<span style={{ color: '#D97706' }}>MARKET</span> PRO
        </Typography>

        <Button 
          variant="text" 
          startIcon={<PointOfSaleIcon />} 
          onClick={() => navigate('/pos')}
          sx={getBtnStyle('/pos')}
        >
          Terminal POS
        </Button>
        
        {isAdminOrSupervisor && (
          <>
            <Button 
              variant="text" 
              startIcon={<ReceiptIcon />} 
              onClick={() => navigate('/ventas')}
              sx={getBtnStyle('/ventas')}
            >
              Ventas
            </Button>
            <Button 
              variant="text" 
              startIcon={<InventoryIcon />} 
              onClick={() => navigate('/inventario')}
              sx={getBtnStyle('/inventario')}
            >
              Inventario
            </Button>
            <Button 
              variant="text" 
              startIcon={<LocalShippingIcon />} 
              onClick={() => navigate('/proveedores')}
              sx={getBtnStyle('/proveedores')}
            >
              Proveedores
            </Button>
            <Button 
              variant="text" 
              startIcon={<DashboardIcon />} 
              onClick={() => navigate('/dashboard')}
              sx={getBtnStyle('/dashboard')}
            >
              Dashboard
            </Button>
          </>
        )}
      </Box>

      {/* Perfil del Usuario y Salida */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar sx={{ bgcolor: getRoleColor(currentRole), width: 32, height: 32, fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            {currentName.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ color: '#4a3e3d', fontWeight: 700, fontSize: '0.85rem' }}>
              {currentName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#8a7b6e', fontSize: '0.7rem', fontWeight: 500 }}>
              <span style={{ color: getRoleColor(currentRole), fontWeight: 700 }}>{currentRole}</span>
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          color="error" 
          size="small"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: '8px', 
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
          Salir
        </Button>
      </Box>
    </Box>
  );
}
