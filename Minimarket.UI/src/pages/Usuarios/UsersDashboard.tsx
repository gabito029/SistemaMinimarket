import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Avatar, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid, Alert 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../services/api';

const UsersDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [userForm, setUserForm] = useState({
    nombre: '',
    username: '',
    contrasena: '',
    rol: 'Cajero'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsers(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNewClick = () => {
    setErrorMessage('');
    setEditingUser(null);
    setUserForm({
      nombre: '',
      username: '',
      contrasena: '',
      rol: 'Cajero'
    });
    setOpenModal(true);
  };

  const handleEditClick = (user: any) => {
    setErrorMessage('');
    setEditingUser(user);
    setUserForm({
      nombre: user.nombre,
      username: user.username,
      contrasena: '', // No pre-llenar contraseña por seguridad
      rol: user.rol || 'Cajero'
    });
    setOpenModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await eliminarUsuario(id);
        fetchUsers();
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data || 'Error al eliminar el usuario.');
      }
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.nombre.trim() || !userForm.username.trim() || !userForm.rol) {
      setErrorMessage('Por favor, completa todos los campos obligatorios (*).');
      return;
    }
    if (!editingUser && !userForm.contrasena) {
      setErrorMessage('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    setErrorMessage('');
    try {
      const payload = {
        nombre: userForm.nombre,
        username: userForm.username,
        contrasena: userForm.contrasena || undefined,
        rol: userForm.rol
      };

      if (editingUser) {
        await actualizarUsuario(editingUser.id, payload);
      } else {
        await crearUsuario(payload);
      }

      setOpenModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data || 'Error al guardar el usuario. Nombre de usuario duplicado.');
    }
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'Administrador': return '#8b5cf6'; // Violeta
      case 'Cajero': return '#3b82f6'; // Azul
      case 'Supervisor': return '#f59e0b'; // Naranja
      default: return '#94a3b8';
    }
  };

  const commonTextFieldSx = {
    '& .MuiInputLabel-root': { color: '#8a7b6e' },
    '& .MuiOutlinedInput-input': { color: '#4a3e3d' },
    '& .MuiSelect-select': { color: '#4a3e3d' },
    '& .MuiOutlinedInput-root': { 
      '& fieldset': { borderColor: '#eadec9' },
      '&:hover fieldset': { borderColor: '#d97706' },
      '&.Mui-focused fieldset': { borderColor: '#d97706' }
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#4a3e3d', mb: 1 }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body1" sx={{ color: '#8a7b6e' }}>
            Control de accesos, roles y personal del sistema.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={handleNewClick}
          sx={{ 
            bgcolor: '#d97706',
            px: 3, py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 14px 0 rgba(217, 119, 6, 0.25)',
            '&:hover': {
              bgcolor: '#b45309',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(217, 119, 6, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ 
        background: '#fff', 
        borderRadius: '16px',
        border: '1px solid #eadec9',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Usuario</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Rol</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Estado</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress sx={{ color: '#d97706' }} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#8a7b6e' }}>
                  No hay usuarios registrados en el sistema.
                </TableCell>
              </TableRow>
            ) : users.map((row) => {
              const userRol = row.rol || 'Cajero';
              const userEstado = row.estado || 'Activo';
              return (
                <TableRow
                  key={row.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background 0.2s',
                    '&:hover': { background: '#fdfbf7' }
                  }}
                >
                  <TableCell sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: getRoleColor(userRol), width: 40, height: 40, fontWeight: 600 }}>
                        {row.nombre ? row.nombre.charAt(0) : 'U'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: '#4a3e3d', fontWeight: 600 }}>{row.nombre}</Typography>
                        <Typography variant="body2" sx={{ color: '#8a7b6e' }}>@{row.username}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <Chip 
                      label={userRol} 
                      size="small" 
                      sx={{ 
                        background: `${getRoleColor(userRol)}15`, 
                        color: getRoleColor(userRol),
                        fontWeight: 650,
                        border: `1px solid ${getRoleColor(userRol)}30`
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <Chip 
                      label={userEstado} 
                      size="small" 
                      sx={{ 
                        background: userEstado === 'Activo' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)', 
                        color: userEstado === 'Activo' ? '#16a34a' : '#dc2626',
                        fontWeight: 600
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <IconButton 
                      onClick={() => handleEditClick(row)}
                      sx={{ color: '#8c7d70', '&:hover': { color: '#d97706', background: 'rgba(217, 119, 6, 0.08)' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(row.id)}
                      sx={{ color: '#8c7d70', '&:hover': { color: '#dc2626', background: 'rgba(220, 38, 38, 0.08)' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal: Crear / Editar Usuario */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: '#fcfbfa',
              border: '1px solid #eadec9',
              borderRadius: '16px',
              color: '#4a3e3d'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #eadec9', pb: 2, color: '#4a3e3d' }}>
          {editingUser ? `Editar Usuario: ${editingUser.username}` : 'Registrar Nuevo Usuario'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nombre Completo *"
                fullWidth
                variant="outlined"
                value={userForm.nombre}
                onChange={e => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre de Usuario (Login) *"
                fullWidth
                variant="outlined"
                value={userForm.username}
                onChange={e => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Rol *"
                select
                fullWidth
                variant="outlined"
                value={userForm.rol}
                onChange={e => setUserForm(prev => ({ ...prev, rol: e.target.value }))}
                sx={commonTextFieldSx}
              >
                <MenuItem value="Cajero">Cajero</MenuItem>
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={editingUser ? "Nueva Contraseña (dejar en blanco para conservar)" : "Contraseña *"}
                type="password"
                fullWidth
                variant="outlined"
                value={userForm.contrasena}
                onChange={e => setUserForm(prev => ({ ...prev, contrasena: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eadec9', px: 3, py: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#8a7b6e' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
          >
            {editingUser ? 'Guardar Cambios' : 'Guardar Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersDashboard;
