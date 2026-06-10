import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Grid, Divider, MenuItem
} from '@mui/material';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SaveIcon from '@mui/icons-material/Save';
import { getProveedores, registrarCompra, getProductos } from '../../services/api';

const ProveedoresDashboard: React.FC = () => {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<any | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  // Form stock order state
  const [orderForm, setOrderForm] = useState({
    nroDocumento: '',
    detalles: [
      { productoId: '', cantidad: 10, precioCosto: 0 }
    ]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const provs = await getProveedores();
      setProveedores(provs);
      const prods = await getProductos();
      setProductos(prods);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenOrder = (prov: any) => {
    setSelectedProveedor(prov);
    setOrderForm({
      nroDocumento: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
      detalles: [
        { productoId: '', cantidad: 10, precioCosto: 0 }
      ]
    });
    setOpenOrderModal(true);
  };

  const handleAddDetailRow = () => {
    setOrderForm(prev => ({
      ...prev,
      detalles: [...prev.detalles, { productoId: '', cantidad: 10, precioCosto: 0 }]
    }));
  };

  const handleRemoveDetailRow = (idx: number) => {
    setOrderForm(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== idx)
    }));
  };

  const handleDetailChange = (idx: number, field: string, val: any) => {
    setOrderForm(prev => {
      const copy = [...prev.detalles];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, detalles: copy };
    });
  };

  const handleSaveOrder = async () => {
    if (!selectedProveedor) return;
    const validDetails = orderForm.detalles.filter(d => d.productoId && d.cantidad > 0 && d.precioCosto >= 0);
    if (validDetails.length === 0) {
      alert("Debes agregar al menos un producto válido con cantidad y costo.");
      return;
    }

    try {
      const payload = {
        proveedorId: selectedProveedor.id,
        nroDocumento: orderForm.nroDocumento,
        detalles: validDetails.map(d => ({
          productoId: parseInt(d.productoId),
          cantidad: Number(d.cantidad),
          precioCosto: Number(d.precioCosto)
        }))
      };

      await registrarCompra(payload);
      alert("¡Pedido registrado exitosamente! El stock de los productos ha sido actualizado.");
      setOpenOrderModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pedido/compra.");
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#4a3e3d', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalShippingIcon fontSize="large" sx={{ color: '#d97706' }} /> Socios y Proveedores
        </Typography>
        <Typography variant="body1" sx={{ color: '#8a7b6e' }}>
          Administra la información de contacto de proveedores y registra pedidos de reabastecimiento de stock.
        </Typography>
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
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Proveedor (Razón Social)</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>RUC</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Contacto (Teléfono)</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Dirección</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }} align="center">Historial</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  <CircularProgress sx={{ color: '#d97706' }} />
                </TableCell>
              </TableRow>
            ) : proveedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#8a7b6e', borderBottom: 0 }}>
                  No se encontraron proveedores registrados.
                </TableCell>
              </TableRow>
            ) : proveedores.map((row) => (
              <TableRow
                key={row.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background 0.2s',
                  '&:hover': { background: '#fdfbf7' }
                }}
              >
                <TableCell sx={{ color: '#4a3e3d', fontWeight: 750, borderBottom: '1px solid #f1efe9' }}>
                  {row.razonSocial}
                </TableCell>
                <TableCell sx={{ color: '#6b5e51', borderBottom: '1px solid #f1efe9' }}>
                  {row.ruc}
                </TableCell>
                <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ContactPhoneIcon sx={{ fontSize: 16, color: '#d97706' }} />
                    {row.telefono || 'Sin registrar'}
                  </span>
                </TableCell>
                <TableCell sx={{ color: '#8a7b6e', borderBottom: '1px solid #f1efe9', fontSize: '0.85rem' }}>
                  {row.direccion || 'Sin dirección registrada'}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid #f1efe9' }}>
                  <Chip 
                    label={`${row.pedidos?.length || 0} pedidos`} 
                    onClick={() => {
                      setSelectedProveedor(row);
                      setOpenDetailsModal(true);
                    }}
                    sx={{ bgcolor: 'rgba(217, 119, 6, 0.12)', color: '#b45309', fontWeight: 700, cursor: 'pointer', border: '1px solid #eadec9', '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.2)' } }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid #f1efe9' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ShoppingBagIcon />}
                    onClick={() => handleOpenOrder(row)}
                    sx={{ bgcolor: '#d97706', borderRadius: '8px', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#b45309' } }}
                  >
                    Pedir Stock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal: Pedir Stock (Nueva Compra) */}
      <Dialog 
        open={openOrderModal} 
        onClose={() => setOpenOrderModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: '#fcfbfa',
              border: '1px solid #eadec9',
              borderRadius: '20px',
              color: '#4a3e3d',
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, borderBottom: '1px solid #eadec9', pb: 2, color: '#4a3e3d' }}>
          Registrar Pedido de Reabastecimiento: {selectedProveedor?.razonSocial}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nro. Comprobante / Guía Remisión"
                fullWidth
                variant="outlined"
                value={orderForm.nroDocumento}
                onChange={e => setOrderForm(prev => ({ ...prev, nroDocumento: e.target.value }))}
                sx={commonTextFieldSx}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#eadec9', my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#4a3e3d' }}>Artículos a Pedir</Typography>

          {orderForm.detalles.map((det, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  label="Seleccionar Producto"
                  select
                  fullWidth
                  variant="outlined"
                  value={det.productoId}
                  onChange={e => handleDetailChange(index, 'productoId', e.target.value)}
                  sx={commonTextFieldSx}
                >
                  <MenuItem value="" disabled>-- Seleccione --</MenuItem>
                  {productos.map(p => (
                    <MenuItem key={p.id} value={p.id.toString()}>{p.nombre} (Stock: {p.stockActual})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Cantidad Pedida"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={det.cantidad}
                  onChange={e => handleDetailChange(index, 'cantidad', Number(e.target.value))}
                  sx={commonTextFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Costo Unitario (S/)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={det.precioCosto}
                  onChange={e => handleDetailChange(index, 'precioCosto', Number(e.target.value))}
                  sx={commonTextFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  color="error" 
                  disabled={orderForm.detalles.length === 1}
                  onClick={() => handleRemoveDetailRow(index)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  Borrar
                </Button>
              </Grid>
            </Grid>
          ))}

          <Button 
            startIcon={<AddIcon />} 
            onClick={handleAddDetailRow}
            sx={{ color: '#d97706', fontWeight: 700, mt: 1, textTransform: 'none' }}
          >
            Agregar Fila
          </Button>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eadec9', px: 3, py: 2 }}>
          <Button onClick={() => setOpenOrderModal(false)} sx={{ color: '#8a7b6e', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveOrder} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, borderRadius: '10px', fontWeight: 600 }}
          >
            Registrar e Incrementar Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Historial de Pedidos */}
      <Dialog
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: '#fcfbfa',
              border: '1px solid #eadec9',
              borderRadius: '20px',
              color: '#4a3e3d',
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, borderBottom: '1px solid #eadec9', pb: 2, color: '#4a3e3d' }}>
          Historial de Pedidos Realizados: {selectedProveedor?.razonSocial}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedProveedor?.pedidos?.length === 0 ? (
            <Typography sx={{ color: '#8a7b6e', textAlign: 'center', py: 4 }}>
              Aún no se han registrado compras o pedidos a este proveedor.
            </Typography>
          ) : (
            selectedProveedor?.pedidos?.map((ped: any) => (
              <Box key={ped.id} sx={{ mb: 4, p: 2, border: '1px solid #eadec9', borderRadius: '12px', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontWeight: 750, color: '#4a3e3d' }}>
                    Documento: {ped.nroDocumento || `Orden #${ped.id}`}
                  </Typography>
                  <Typography sx={{ color: '#d97706', fontWeight: 800 }}>
                    Total: S/ {ped.total.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#8a7b6e', mb: 2 }}>
                  Fecha y Hora del Pedido: {new Date(ped.fecha).toLocaleString()}
                </Typography>

                <Table size="small" sx={{ mt: 1, border: '1px solid #f1efe9', borderRadius: '8px' }}>
                  <TableHead sx={{ bgcolor: '#fcfbfa' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }}>Producto solicitado</TableCell>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }} align="center">Cantidad</TableCell>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }} align="right">Precio Costo</TableCell>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }} align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ped.detalles?.map((det: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: '#4a3e3d' }}>{det.productoNombre || `Producto #${det.productoId}`}</TableCell>
                        <TableCell align="center" sx={{ color: '#4a3e3d' }}>{det.cantidad}</TableCell>
                        <TableCell align="right" sx={{ color: '#4a3e3d' }}>S/ {det.precioCosto.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: '#4a3e3d', fontWeight: 600 }}>S/ {(det.cantidad * det.precioCosto).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eadec9', px: 3, py: 2 }}>
          <Button onClick={() => setOpenDetailsModal(false)} sx={{ color: '#8a7b6e', fontWeight: 600 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProveedoresDashboard;
