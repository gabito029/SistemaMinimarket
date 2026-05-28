import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Grid, InputAdornment, Alert 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { getProductos, getCategorias, crearCategoria, crearProducto, actualizarProducto, eliminarProducto } from '../../services/api';
import axios from 'axios';

const InventoryDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Modals state
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openStockModal, setOpenStockModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Stock Adjustment State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    cantidad: 0,
    tipoAjuste: 'Ingreso',
    justificacion: 'Reposición de almacén'
  });

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [productForm, setProductForm] = useState({
    codigoBarras: '',
    nombre: '',
    precioCosto: 0,
    precioVenta: 0,
    stockActual: 0,
    stockMinimo: 5,
    categoriaId: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const prodData = await getProductos();
      setProducts(prodData);
      
      const catData = await getCategorias();
      setCategories(catData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const nueva = await crearCategoria({ nombre: newCategoryName });
      setCategories(prev => [...prev, nueva]);
      setProductForm(prev => ({ ...prev, categoriaId: nueva.id.toString() }));
      setNewCategoryName('');
      setOpenCategoryModal(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la categoría.');
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.nombre.trim() || !productForm.categoriaId) {
      setErrorMessage('Por favor, completa los campos obligatorios (*).');
      return;
    }
    setErrorMessage('');
    try {
      const payload = {
        ...productForm,
        precioCosto: Number(productForm.precioCosto),
        precioVenta: Number(productForm.precioVenta),
        stockActual: Number(productForm.stockActual),
        stockMinimo: Number(productForm.stockMinimo),
        categoriaId: Number(productForm.categoriaId)
      };

      if (editingProduct) {
        await actualizarProducto(editingProduct.id, payload);
      } else {
        await crearProducto(payload);
      }

      setOpenProductModal(false);
      setEditingProduct(null);
      setProductForm({
        codigoBarras: '',
        nombre: '',
        precioCosto: 0,
        precioVenta: 0,
        stockActual: 0,
        stockMinimo: 5,
        categoriaId: ''
      });
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data || err.response?.data?.message || 'Error al guardar el producto. Asegúrate de que el código de barras no esté duplicado.');
    }
  };

  const handleEditClick = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      codigoBarras: prod.codigoBarras || '',
      nombre: prod.nombre,
      precioCosto: prod.precioCosto || 0,
      precioVenta: prod.precioVenta,
      stockActual: prod.stockActual,
      stockMinimo: prod.stockMinimo || 5,
      categoriaId: prod.categoriaId ? prod.categoriaId.toString() : ''
    });
    setOpenProductModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await eliminarProducto(id);
        loadData();
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data || 'Error al eliminar el producto.');
      }
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct || stockAdjustment.cantidad <= 0) return;
    try {
      await axios.post(`http://localhost:5288/api/Inventario/productos/${selectedProduct.id}/ajuste-stock`, {
        cantidad: Number(stockAdjustment.cantidad),
        tipoAjuste: stockAdjustment.tipoAjuste,
        justificacion: stockAdjustment.justificacion
      });
      setOpenStockModal(false);
      setStockAdjustment({
        cantidad: 0,
        tipoAjuste: 'Ingreso',
        justificacion: 'Reposición de almacén'
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error al ajustar el stock.');
    }
  };

  const exportToCSV = () => {
    if (products.length === 0) return;
    
    // Encabezados
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para acentos en Excel
    csvContent += "ID,Codigo Barras,Producto,Categoria,Precio Costo,Precio Venta,Stock Actual,Stock Minimo\n";
    
    products.forEach(p => {
      const catObj = categories.find(c => c.id === p.categoriaId);
      const row = [
        p.id,
        `"${p.codigoBarras || ''}"`,
        `"${p.nombre}"`,
        `"${catObj?.nombre || 'General'}"`,
        p.precioCosto,
        p.precioVenta,
        p.stockActual,
        p.stockMinimo
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Inventario_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const commonTextFieldSx = {
    '& .MuiInputLabel-root': { color: '#94a3b8' },
    '& .MuiOutlinedInput-input': { color: 'white' },
    '& .MuiSelect-select': { color: 'white' },
    '& .MuiOutlinedInput-root': { 
      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&:hover fieldset': { borderColor: '#3b82f6' },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
            Gestión de Inventario
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Control y administración de productos y existencias.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
            disabled={products.length === 0}
            sx={{
              borderColor: 'rgba(52, 211, 153, 0.4)',
              color: '#34d399',
              px: 2.5, py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#34d399',
                background: 'rgba(52, 211, 153, 0.08)'
              }
            }}
          >
            Exportar CSV (Excel)
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => setOpenCategoryModal(true)}
            sx={{ 
              color: '#3b82f6',
              borderColor: 'rgba(59, 130, 246, 0.4)',
              px: 2.5, py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#3b82f6',
                background: 'rgba(59, 130, 246, 0.08)'
              }
            }}
          >
            Nueva Categoría
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              setErrorMessage('');
              setEditingProduct(null);
              setProductForm({
                codigoBarras: '',
                nombre: '',
                precioCosto: 0,
                precioVenta: 0,
                stockActual: 0,
                stockMinimo: 5,
                categoriaId: ''
              });
              setOpenProductModal(true);
            }}
            sx={{ 
              bgcolor: 'var(--primary)',
              px: 3, py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
              '&:hover': {
                bgcolor: 'var(--primary-hover)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ 
        background: 'var(--bg-panel)', 
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Código</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Producto</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Categoría</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }} align="center">Stock Actual</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }} align="right">Precio Venta</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  <CircularProgress sx={{ color: 'var(--primary)' }} />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8', borderBottom: 0 }}>
                  No hay productos registrados en la base de datos.
                </TableCell>
              </TableRow>
            ) : products.map((row) => {
              const catObj = categories.find(c => c.id === row.categoriaId);
              return (
                <TableRow
                  key={row.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background 0.2s',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.03)' }
                  }}
                >
                  <TableCell sx={{ color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.codigoBarras || '-'}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.nombre}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Chip label={catObj?.nombre || 'General'} size="small" sx={{ background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1' }} />
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {row.stockActual <= row.stockMinimo && (
                        <WarningAmberIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                      )}
                      <Typography sx={{ 
                        color: row.stockActual <= row.stockMinimo ? '#fbbf24' : '#e2e8f0',
                        fontWeight: row.stockActual <= row.stockMinimo ? 700 : 400
                      }}>
                        {row.stockActual}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    S/ {row.precioVenta.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <IconButton 
                      title="Reponer / Ajustar Stock"
                      onClick={() => {
                        setSelectedProduct(row);
                        setOpenStockModal(true);
                      }}
                      sx={{ color: '#34d399', '&:hover': { color: '#10b981', background: 'rgba(52, 211, 153, 0.1)' } }}
                    >
                      <SwapVertIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleEditClick(row)}
                      sx={{ color: '#94a3b8', '&:hover': { color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteProduct(row.id)}
                      sx={{ color: '#94a3b8', '&:hover': { color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' } }}
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

      {/* Modal: Reponer / Ajustar Stock */}
      <Dialog 
        open={openStockModal} 
        onClose={() => setOpenStockModal(false)}
        slotProps={{
          paper: {
            sx: {
              background: 'var(--bg-panel)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#fff'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Ajustar Stock: {selectedProduct?.nombre}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Stock actual: <strong>{selectedProduct?.stockActual}</strong> unidades.
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Tipo de Ajuste"
                select
                fullWidth
                variant="outlined"
                value={stockAdjustment.tipoAjuste}
                onChange={e => setStockAdjustment(prev => ({ ...prev, tipoAjuste: e.target.value }))}
                sx={commonTextFieldSx}
              >
                <MenuItem value="Ingreso">Ingreso (Reponer Stock)</MenuItem>
                <MenuItem value="Salida">Salida (Mermas / Pérdidas)</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Cantidad"
                type="number"
                fullWidth
                variant="outlined"
                value={stockAdjustment.cantidad === 0 ? '' : stockAdjustment.cantidad}
                onChange={e => setStockAdjustment(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Justificación / Nota"
                fullWidth
                variant="outlined"
                value={stockAdjustment.justificacion}
                onChange={e => setStockAdjustment(prev => ({ ...prev, justificacion: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenStockModal(false)} sx={{ color: '#cbd5e1' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAdjustStock} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }}
          >
            Guardar Ajuste
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Nuevo Producto */}
      <Dialog 
        open={openProductModal} 
        onClose={() => setOpenProductModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: 'var(--bg-panel)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#fff'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          {editingProduct ? `Editar Producto: ${editingProduct.nombre}` : 'Registrar Nuevo Producto'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre del Producto *"
                fullWidth
                variant="outlined"
                value={productForm.nombre}
                onChange={e => setProductForm(prev => ({ ...prev, nombre: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Código de Barras"
                fullWidth
                variant="outlined"
                value={productForm.codigoBarras}
                onChange={e => setProductForm(prev => ({ ...prev, codigoBarras: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Categoría *"
                select
                fullWidth
                variant="outlined"
                value={productForm.categoriaId}
                onChange={e => setProductForm(prev => ({ ...prev, categoriaId: e.target.value }))}
                sx={commonTextFieldSx}
              >
                {categories.length === 0 ? (
                  <MenuItem value="" disabled>No hay categorías creadas. ¡Crea una primero!</MenuItem>
                ) : (
                  categories.map(c => (
                    <MenuItem key={c.id} value={c.id.toString()}>{c.nombre}</MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Stock Inicial"
                type="number"
                fullWidth
                variant="outlined"
                value={productForm.stockActual}
                onChange={e => setProductForm(prev => ({ ...prev, stockActual: Number(e.target.value) }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Precio Costo *"
                type="number"
                fullWidth
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: '#94a3b8' } }}>S/</InputAdornment>,
                  }
                }}
                value={productForm.precioCosto}
                onChange={e => setProductForm(prev => ({ ...prev, precioCosto: Number(e.target.value) }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Precio Venta *"
                type="number"
                fullWidth
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: '#94a3b8' } }}>S/</InputAdornment>,
                  }
                }}
                value={productForm.precioVenta}
                onChange={e => setProductForm(prev => ({ ...prev, precioVenta: Number(e.target.value) }))}
                sx={commonTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Stock Mínimo (Alerta)"
                type="number"
                fullWidth
                variant="outlined"
                value={productForm.stockMinimo}
                onChange={e => setProductForm(prev => ({ ...prev, stockMinimo: Number(e.target.value) }))}
                sx={commonTextFieldSx}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', px: 3, py: 2 }}>
          <Button onClick={() => setOpenProductModal(false)} sx={{ color: '#cbd5e1' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained" 
            sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }}
          >
            {editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Nueva Categoría */}
      <Dialog 
        open={openCategoryModal} 
        onClose={() => setOpenCategoryModal(false)}
        slotProps={{
          paper: {
            sx: {
              background: 'var(--bg-panel)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#fff'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Nueva Categoría</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
            Crea clasificaciones para organizar tus productos.
          </Typography>
          <TextField
            autoFocus
            label="Nombre de la Categoría *"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            sx={commonTextFieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenCategoryModal(false)} sx={{ color: '#cbd5e1' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateCategory} 
            variant="contained" 
            sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard;
