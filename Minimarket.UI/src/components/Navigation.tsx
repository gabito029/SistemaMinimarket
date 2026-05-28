import { Box, Typography, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function Navigation() {
  const navigate = useNavigate();

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

  return (
    <Box className="glass-panel" sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mr: 4, color: 'var(--primary)' }}>
          MINIMARKET PRO
        </Typography>
        <Button 
          variant="text" 
          startIcon={<PointOfSaleIcon />} 
          onClick={() => navigate('/pos')}
          sx={{ color: 'white', fontWeight: 600 }}
        >
          Terminal POS
        </Button>
        
        {(currentRole.toLowerCase() === 'administrador' || currentRole.toLowerCase() === 'admin') && (
          <Button 
            variant="text" 
            startIcon={<InventoryIcon />} 
            onClick={() => navigate('/inventario')}
            sx={{ color: 'white', fontWeight: 600 }}
          >
            Inventario (Admin)
          </Button>
        )}
      </Box>

      {/* Perfil del Usuario y Salida */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar sx={{ bgcolor: getRoleColor(currentRole), width: 32, height: 32, fontSize: '0.85rem', fontWeight: 700 }}>
            {currentName.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
              {currentName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>
              <span style={{ color: getRoleColor(currentRole) }}>{currentRole}</span>
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
            color: '#f87171',
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
