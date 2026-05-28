import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, TextField, Button, IconButton, Divider, Select, 
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Navigation from '../../components/Navigation';
import { getProductos, getCajaActiva, abrirCaja, cerrarCaja, registrarVenta, getVentas } from '../../services/api';

interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  precioVenta: number;
  stockActual: number;
}

interface CartItem extends Producto {
  cantidad: number;
}

export default function PosDashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  
  // Caja Session States
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openAperturaModal, setOpenAperturaModal] = useState(false);
  const [openCierreModal, setOpenCierreModal] = useState(false);
  const [montoApertura, setMontoApertura] = useState<number>(0);
  const [montoCierre, setMontoCierre] = useState<number>(0);
  const [cajaError, setCajaError] = useState('');

  const authUserString = localStorage.getItem('auth_user');
  const authUser = authUserString ? JSON.parse(authUserString) : null;
  const currentRole = authUser ? authUser.rol : 'Administrador';

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getProductos();
      setProductos(prods);

      try {
        const activeCaja = await getCajaActiva();
        setCajaActiva(activeCaja);
        setOpenAperturaModal(false);
      } catch (err) {
        // Si arroja 404 o error, significa que no hay sesión de caja activa
        setCajaActiva(null);
        setOpenAperturaModal(true);
      }
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    // 1. Buscar coincidencia exacta por código de barras
    let producto = productos.find(p => p.codigoBarras && p.codigoBarras.trim() === searchCode.trim());

    // 2. Si no coincide exactamente, buscar el primero que contenga el nombre coincidente
    if (!producto) {
      producto = productos.find(p => p.nombre.toLowerCase().includes(searchCode.toLowerCase()));
    }

    if (producto) {
      addToCart(producto);
      setSearchCode('');
    } else {
      alert("Producto no encontrado. Intenta con otro nombre o código.");
    }
  };

  // Filtrado de productos del catálogo de acceso rápido en tiempo real
  const filteredProductos = productos.filter(p => {
    const term = searchCode.toLowerCase();
    return p.nombre.toLowerCase().includes(term) || (p.codigoBarras && p.codigoBarras.includes(term));
  });

  const addToCart = (producto: Producto) => {
    if (producto.stockActual <= 0) {
      alert(`El producto ${producto.nombre} no tiene stock disponible.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === producto.id);
      const currentQty = existing ? existing.cantidad : 0;
      if (producto.stockActual <= currentQty) {
        alert(`Stock insuficiente de ${producto.nombre}. Máximo disponible: ${producto.stockActual}`);
        return prev;
      }

      if (existing) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.precioVenta * item.cantidad), 0);

  const processSale = async () => {
    if (cart.length === 0) return;
    if (!cajaActiva) {
      alert('Error: Debe tener una sesión de caja abierta para registrar ventas.');
      setOpenAperturaModal(true);
      return;
    }

    try {
      const payload = {
        sesionCajaId: cajaActiva.id,
        clienteId: null,
        metodoPago: metodoPago,
        detalles: cart.map(c => ({ productoId: c.id, cantidad: c.cantidad }))
      };
      
      await registrarVenta(payload);
      alert('¡Venta completada con éxito en la base de datos!');
      setCart([]);
      loadData(); // Recargar productos para actualizar stock en pantalla
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data || 'Error al procesar la venta. Verifique los stocks.');
    }
  };

  const handleAbrirCaja = async () => {
    setCajaError('');
    try {
      const nuevaSesion = await abrirCaja(montoApertura);
      setCajaActiva(nuevaSesion);
      setOpenAperturaModal(false);
      setMontoApertura(0);
      alert('¡Caja abierta con éxito!');
    } catch (err: any) {
      setCajaError(err.response?.data || 'Error al abrir caja.');
    }
  };

  const handleCerrarCaja = async () => {
    if (!cajaActiva) return;
    setCajaError('');
    try {
      await cerrarCaja(cajaActiva.id, montoCierre);
      setCajaActiva(null);
      setOpenCierreModal(false);
      setMontoCierre(0);
      setCart([]);
      alert('¡Caja cerrada con éxito!');
      setOpenAperturaModal(true); // Solicitar apertura de caja nuevamente
    } catch (err: any) {
      setCajaError(err.response?.data || 'Error al cerrar caja.');
    }
  };

  const exportRendicionPDF = async () => {
    if (!cajaActiva) return;
    try {
      const ventas = await getVentas();
      
      const ventasSesion = ventas.filter((v: any) => v.sesionCajaId === cajaActiva.id);
      
      const efectivo = ventasSesion.filter((v: any) => v.metodoPago === 'EFECTIVO').reduce((sum: number, v: any) => sum + v.total, 0);
      const tarjeta = ventasSesion.filter((v: any) => v.metodoPago === 'TARJETA').reduce((sum: number, v: any) => sum + v.total, 0);
      const credito = ventasSesion.filter((v: any) => v.metodoPago === 'CREDITO').reduce((sum: number, v: any) => sum + v.total, 0);
      const totalSesion = ventasSesion.reduce((sum: number, v: any) => sum + v.total, 0);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Por favor, permite las ventanas emergentes en tu navegador para generar el PDF.");
        return;
      }

      const fechaApertura = new Date(cajaActiva.fechaApertura).toLocaleString();
      const rolDelUsuario = localStorage.getItem('user_role') || 'Cajero';

      printWindow.document.write(`
        <html>
          <head>
            <title>Rendicion_de_Cuentas_Caja_${cajaActiva.id}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #333; padding-bottom: 15px; }
              .header h1 { margin: 0; font-size: 26px; text-transform: uppercase; color: #1e3a8a; }
              .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; font-weight: 500; }
              .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #ddd; margin-top: 30px; margin-bottom: 15px; padding-bottom: 5px; text-transform: uppercase; color: #1e3a8a; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; borderRadius: 8px; }
              .info-item { font-size: 14px; }
              .info-item strong { color: #0f172a; }
              .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .summary-table th, .summary-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }
              .summary-table th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
              .summary-table td.amount { text-align: right; font-weight: bold; }
              .sales-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .sales-table th, .sales-table td { padding: 10px 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
              .sales-table th { background-color: #f8fafc; font-weight: 600; color: #334155; }
              .sales-table td.amount { text-align: right; }
              .footer-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 80px; text-align: center; }
              .signature-line { border-top: 1px solid #333; padding-top: 10px; font-size: 12px; margin: 0 40px; font-weight: 600; color: #334155; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>MINIMARKET PRO</h1>
              <p>REPORTE DE RENDICIÓN DE CUENTAS - TURNO DE CAJA</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item"><strong>ID de Sesión:</strong> #${cajaActiva.id}</div>
              <div class="info-item"><strong>Responsable / Rol:</strong> ${rolDelUsuario}</div>
              <div class="info-item"><strong>Fecha de Apertura:</strong> ${fechaApertura}</div>
              <div class="info-item"><strong>Monto Inicial (Efectivo):</strong> S/ ${cajaActiva.montoApertura.toFixed(2)}</div>
              <div class="info-item"><strong>Transacciones del Turno:</strong> ${ventasSesion.length} ventas</div>
            </div>

            <div class="section-title">Resumen de Ventas y Balance</div>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Concepto / Método de Pago</th>
                  <th style="text-align: right; width: 150px;">Total Acumulado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ventas en Efectivo</td>
                  <td class="amount">S/ ${efectivo.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Ventas con Tarjeta</td>
                  <td class="amount">S/ ${tarjeta.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Ventas a Crédito</td>
                  <td class="amount">S/ ${credito.toFixed(2)}</td>
                </tr>
                <tr style="font-size: 15px; border-top: 2px solid #0f172a; background-color: #f8fafc;">
                  <td><strong>TOTAL DE VENTAS ACUMULADAS</strong></td>
                  <td class="amount" style="color: #1e3a8a;"><strong>S/ ${totalSesion.toFixed(2)}</strong></td>
                </tr>
                <tr style="font-size: 15px; background-color: #f1f5f9;">
                  <td><strong>SALDO ESTIMADO EN CAJA FÍSICA (Efectivo Inicial + Efectivo Ventas)</strong></td>
                  <td class="amount" style="color: #16a34a;"><strong>S/ ${(cajaActiva.montoApertura + efectivo).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="section-title">Listado de Comprobantes Emitidos</div>
            <table class="sales-table">
              <thead>
                <tr>
                  <th>Venta ID</th>
                  <th>Hora</th>
                  <th>Método de Pago</th>
                  <th>Estado</th>
                  <th class="amount">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                ${ventasSesion.map((v: any) => `
                  <tr>
                    <td>#${v.id}</td>
                    <td>${new Date(v.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${v.metodoPago}</td>
                    <td>${v.estado}</td>
                    <td class="amount">S/ ${v.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
                ${ventasSesion.length === 0 ? `
                  <tr>
                    <td colspan="5" style="text-align: center; color: #64748b; padding: 20px; font-weight: 500;">
                      No se registraron ventas en esta sesión de caja.
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>

            <div class="footer-signatures">
              <div>
                <div style="height: 50px;"></div>
                <div class="signature-line">Firma del Cajero</div>
              </div>
              <div>
                <div style="height: 50px;"></div>
                <div class="signature-line">Firma del Administrador / Supervisor</div>
              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      alert("Error al generar la rendición de cuentas.");
    }
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
    <Box sx={{ p: 4, minHeight: '100vh', animation: 'fadeIn 0.5s ease-out' }}>
      <Navigation />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
          <PointOfSaleIcon fontSize="large" color="primary" /> Terminal POS
        </Typography>
        
        {cajaActiva ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert severity="success" icon={<LockOpenIcon />} sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', py: 0, px: 2 }}>
              Caja Abierta (ID: {cajaActiva.id})
            </Alert>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<FileDownloadIcon />}
              onClick={exportRendicionPDF}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa', '&:hover': { borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.08)' } }}
            >
              Exportar Rendición (PDF)
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LockIcon />}
              onClick={() => setOpenCierreModal(true)}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Cerrar Turno
            </Button>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            color="warning" 
            startIcon={<LockOpenIcon />}
            onClick={() => setOpenAperturaModal(true)}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Abrir Turno de Caja
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress sx={{ color: 'var(--primary)' }} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Buscador inteligente */}
            <Box className="glass-panel fade-in" sx={{ p: 3, mb: 3 }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                <TextField 
                  fullWidth 
                  variant="outlined" 
                  placeholder="Escribir nombre o escanear código de barras..." 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  sx={commonTextFieldSx}
                />
                <Button type="submit" variant="contained" sx={{ px: 4, borderRadius: 2 }}>
                  Agregar / Buscar
                </Button>
              </form>
            </Box>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'white' }}>
              Catálogo de Productos ({filteredProductos.length})
            </Typography>
            
            <Grid container spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
              {filteredProductos.map(prod => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prod.id}>
                  <Box 
                    className="glass-panel fade-in" 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer', 
                      opacity: prod.stockActual <= 0 ? 0.6 : 1,
                      transition: 'all 0.2s', 
                      '&:hover': prod.stockActual > 0 ? { transform: 'translateY(-4px)', borderColor: 'var(--primary)' } : {} 
                    }}
                    onClick={() => addToCart(prod)}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.nombre}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography color="primary" sx={{ fontWeight: 700 }}>
                        S/ {prod.precioVenta.toFixed(2)}
                      </Typography>
                      {(currentRole.toLowerCase() === 'administrador' || currentRole.toLowerCase() === 'admin') && (
                        <Typography variant="caption" sx={{ color: prod.stockActual <= 5 ? '#fbbf24' : '#94a3b8', fontWeight: prod.stockActual <= 5 ? 700 : 400 }}>
                          Stock: {prod.stockActual}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
              {filteredProductos.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography sx={{ color: '#94a3b8', textAlign: 'center', mt: 4 }}>
                    No se encontraron productos que coincidan con la búsqueda.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box className="glass-panel fade-in" sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '60vh' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>Carrito de Venta</Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '35vh' }}>
                {cart.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>{item.nombre}</Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        {item.cantidad} x S/ {item.precioVenta.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>S/ {(item.cantidad * item.precioVenta).toFixed(2)}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                {cart.length === 0 && (
                  <Typography sx={{ color: '#94a3b8', textAlign: 'center', mt: 4 }}>
                    Agrega productos para empezar
                  </Typography>
                )}
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>Método de Pago</Typography>
                <Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiSvgIcon-root': { color: 'white' } }}
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TARJETA">Tarjeta</MenuItem>
                  <MenuItem value="CREDITO">Crédito</MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 400, color: 'white' }}>Total a Pagar</Typography>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 800 }}>S/ {total.toFixed(2)}</Typography>
              </Box>

              <Button 
                variant="contained" 
                color="success" 
                size="large" 
                fullWidth 
                startIcon={<AddShoppingCartIcon />}
                onClick={processSale}
                disabled={cart.length === 0 || !cajaActiva}
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2 }}
              >
                COBRAR AHORA
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Modal: Apertura de Caja */}
      <Dialog 
        open={openAperturaModal} 
        slotProps={{
          paper: {
            sx: {
              background: 'var(--bg-panel)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#fff',
              minWidth: '350px'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Apertura de Turno de Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Para poder procesar ventas en el POS, primero debes abrir el turno de caja e ingresar el saldo inicial en efectivo.
          </Typography>
          {cajaError && <Alert severity="error" sx={{ mb: 2 }}>{cajaError}</Alert>}
          <TextField
            autoFocus
            label="Monto de Apertura (S/)"
            type="number"
            fullWidth
            variant="outlined"
            value={montoApertura === 0 ? '' : montoApertura}
            onChange={(e) => setMontoApertura(Number(e.target.value))}
            sx={commonTextFieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleAbrirCaja} 
            variant="contained" 
            fullWidth
            sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' }, py: 1.2, fontWeight: 600 }}
          >
            Iniciar Turno
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Cierre de Caja */}
      <Dialog 
        open={openCierreModal} 
        onClose={() => setOpenCierreModal(false)}
        slotProps={{
          paper: {
            sx: {
              background: 'var(--bg-panel)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#fff',
              minWidth: '350px'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Cierre de Turno de Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Ingresa el monto de dinero físico real en caja para cerrar el turno y reportar descuadres.
          </Typography>
          {cajaError && <Alert severity="error" sx={{ mb: 2 }}>{cajaError}</Alert>}
          <TextField
            autoFocus
            label="Monto de Cierre Real (S/)"
            type="number"
            fullWidth
            variant="outlined"
            value={montoCierre === 0 ? '' : montoCierre}
            onChange={(e) => setMontoCierre(Number(e.target.value))}
            sx={commonTextFieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: 'flex', gap: 2 }}>
          <Button onClick={() => setOpenCierreModal(false)} sx={{ color: '#cbd5e1', flex: 1 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCerrarCaja} 
            variant="contained" 
            color="error"
            sx={{ py: 1.2, fontWeight: 600, flex: 1 }}
          >
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
