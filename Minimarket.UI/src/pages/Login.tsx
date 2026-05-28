import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { loginUsuario } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await loginUsuario(username.trim(), password);
      // Guardar el objeto de usuario en localStorage
      localStorage.setItem('auth_user', JSON.stringify(data));
      localStorage.setItem('user_role', data.rol); // Mantener compatibilidad

      // Redirigir según el rol
      if (data.rol === 'Cajero') {
        navigate('/pos');
      } else {
        navigate('/inventario');
      }
      
      // Forzar recarga para actualizar barra de navegación / sidebar
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || 'Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const commonTextFieldSx = {
    mb: 3,
    '& .MuiInputLabel-root': { color: '#94a3b8' },
    '& .MuiOutlinedInput-input': { color: 'white' },
    '& .MuiOutlinedInput-root': { 
      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&:hover fieldset': { borderColor: '#3b82f6' },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      p: 2
    }}>
      <Paper 
        className="glass-panel" 
        elevation={0}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 420,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        {/* Logo Icon */}
        <Box sx={{ 
          display: 'inline-flex', 
          p: 2, 
          bgcolor: 'rgba(59, 130, 246, 0.12)', 
          borderRadius: '20px', 
          mb: 2,
          border: '1px solid rgba(59, 130, 246, 0.2)' 
        }}>
          <PointOfSaleIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1, letterSpacing: '0.5px' }}>
          MINI<span style={{ color: '#3b82f6' }}>MARKET</span>
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>
          Inicia sesión para ingresar al sistema de ventas e inventario
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            label="Nombre de Usuario"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={commonTextFieldSx}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={commonTextFieldSx}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
            sx={{
              py: 1.8,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '14px',
              bgcolor: '#3b82f6',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
              '&:hover': {
                bgcolor: '#2563eb',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Verificando...' : 'INGRESAR'}
          </Button>
        </form>

        <Typography variant="caption" sx={{ display: 'block', mt: 4, color: '#475569' }}>
          Sistema Minimarket Pro v1.0.0 © 2026
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
