import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, TextField, Button, IconButton, Divider, Select, 
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Chip
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PrintIcon from '@mui/icons-material/Print';
import Navigation from '../../components/Navigation';
import { getProductos, getCajaActiva, abrirCaja, cerrarCaja, registrarVenta, getVentas } from '../../services/api';

interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  precioVenta: number;
  stockActual: number;
  fechaVencimiento?: string | null;
  precioCosto?: number;
}

interface CartItem extends Producto {
  cantidad: number;
}

export default function PosDashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState<string>('');
  const [openClienteModal, setOpenClienteModal] = useState(false);
  const [newClienteForm, setNewClienteForm] = useState({
    nombre: '',
    documento: '',
    limiteCredito: 100
  });
  const [clienteError, setClienteError] = useState('');
  
  // Caja Session States
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openAperturaModal, setOpenAperturaModal] = useState(false);
  const [openCierreModal, setOpenCierreModal] = useState(false);
  const [montoApertura, setMontoApertura] = useState<number>(0);
  const [montoCierre, setMontoCierre] = useState<number>(0);
  const [cajaError, setCajaError] = useState('');
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  const [openReceiptModal, setOpenReceiptModal] = useState(false);

  const handlePrintInvoice = (sale: any) => {
    if (!sale) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes en tu navegador para imprimir la boleta.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Pago - Venta #${sale.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 12px; line-height: 1.4; color: #000; padding: 20px; max-width: 280px; margin: 0 auto; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .flex-between { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { text-align: left; font-size: 11px; }
            .th-right, .td-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="text-center bold" style="font-size: 16px;">MINI MARKET</div>
          <div class="text-center">Resumen de Venta Realizada</div>
          <div class="divider"></div>
          <div><span class="bold">Boleta Nro:</span> CP-000${sale.id}</div>
          <div><span class="bold">Fecha:</span> ${new Date(sale.fechaHora).toLocaleString()}</div>
          <div><span class="bold">Cliente:</span> ${sale.cliente?.nombre || 'Público General'}</div>
          <div><span class="bold">Cajero:</span> ${sale.sesionCaja?.usuario?.nombre || 'Administrador'}</div>
          <div><span class="bold">Metodo Pago:</span> ${sale.metodoPago || 'EFECTIVO'}</div>
          <div><span class="bold">Estado:</span> ${sale.estado || 'Completada'}</div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr>
                <th>Prod</th>
                <th class="th-right">Cant</th>
                <th class="th-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.detalleVenta?.map((d: any) => `
                <tr>
                  <td>${d.producto?.nombre || ('Prod #' + d.productoId)}</td>
                  <td class="td-right">${d.cantidad}</td>
                  <td class="td-right">S/ ${d.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="flex-between bold" style="font-size: 14px;">
            <span>TOTAL COBRADO:</span>
            <span>S/ ${sale.total.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="text-center bold">¡GRACIAS POR SU COMPRA!</div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const authUserString = localStorage.getItem('auth_user');
  const authUser = authUserString ? JSON.parse(authUserString) : null;
  const currentRole = authUser ? authUser.rol : 'Administrador';

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getProductos();
      setProductos(prods);

      // Cargar clientes para la venta
      try {
        const response = await fetch('http://localhost:5288/api/Creditos/clientes');
        if (response.ok) {
          const cls = await response.json();
          setClientes(cls);
        }
      } catch (err) {
        console.error("Error al obtener clientes:", err);
      }

      try {
        const activeCaja = await getCajaActiva();
        setCajaActiva(activeCaja);
        setOpenAperturaModal(false);
      } catch (err) {
        // Si arroja 404 o error, significa que no hay sesión de caja activa. No obligamos a abrir en la carga inicial
        setCajaActiva(null);
        setOpenAperturaModal(false);
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
    if (!cajaActiva) {
      alert("Para poder realizar ventas y agregar productos al carrito, primero debes abrir el turno de caja.");
      setOpenAperturaModal(true);
      return;
    }

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
        clienteId: clienteId ? parseInt(clienteId) : null,
        metodoPago: metodoPago,
        detalles: cart.map(c => ({ productoId: c.id, cantidad: c.cantidad }))
      };
      
      const createdVenta = await registrarVenta(payload);
      setCompletedSale(createdVenta);
      setOpenReceiptModal(true);
      setCart([]);
      setClienteId('');
      loadData(); // Recargar productos para actualizar stock en pantalla
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data || 'Error al procesar la venta. Verifique los stocks.');
    }
  };

  const handleCreateCliente = async () => {
    setClienteError('');
    if (!newClienteForm.nombre.trim() || !newClienteForm.documento.trim()) {
      setClienteError('Por favor complete Nombre y Documento.');
      return;
    }

    // Comprobar si el DNI/RUC ya existe en el estado local de clientes antes de enviar al API
    const existe = clientes.find(c => c.documento.trim() === newClienteForm.documento.trim());
    if (existe) {
      alert(`El cliente con documento ${newClienteForm.documento} ya está registrado como "${existe.nombre}". Se seleccionará de inmediato.`);
      setClienteId(existe.id.toString());
      setOpenClienteModal(false);
      setNewClienteForm({ nombre: '', documento: '', limiteCredito: 100 });
      return;
    }

    try {
      const response = await fetch('http://localhost:5288/api/Creditos/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newClienteForm.nombre,
          documento: newClienteForm.documento,
          limiteCredito: Number(newClienteForm.limiteCredito)
        })
      });

      if (response.ok) {
        const createdClient = await response.json();
        alert(`¡Cliente ${createdClient.nombre} registrado con éxito!`);
        // Recargar la lista de clientes
        const reloadRes = await fetch('http://localhost:5288/api/Creditos/clientes');
        if (reloadRes.ok) {
          const cls = await reloadRes.json();
          setClientes(cls);
        }
        setClienteId(createdClient.id.toString());
        setOpenClienteModal(false);
        setNewClienteForm({ nombre: '', documento: '', limiteCredito: 100 });
      } else {
        const errMsg = await response.text();
        setClienteError(errMsg || 'Error al guardar el cliente en el servidor.');
      }
    } catch (e: any) {
      console.error(e);
      setClienteError('Error de red al registrar el cliente.');
    }
  };

  const handleAbrirCaja = async () => {
    setCajaError('');
    try {
      const usuarioId = authUser ? authUser.id : null;
      const nuevaSesion = await abrirCaja(montoApertura, usuarioId);
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
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: '#FDFBF7', animation: 'fadeIn 0.5s ease-out' }}>
      <Navigation />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, color: '#4a3e3d' }}>
          <PointOfSaleIcon fontSize="large" sx={{ color: '#d97706' }} /> Terminal POS
        </Typography>
        
        {cajaActiva ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert severity="success" icon={<LockOpenIcon />} sx={{ bgcolor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', border: '1px solid rgba(22, 163, 74, 0.3)', py: 0, px: 2 }}>
              Caja Abierta (ID: {cajaActiva.id})
            </Alert>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<FileDownloadIcon />}
              onClick={exportRendicionPDF}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(217, 119, 6, 0.4)', color: '#d97706', '&:hover': { borderColor: '#b45309', background: 'rgba(217, 119, 6, 0.08)' } }}
            >
              Exportar Rendición (PDF)
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LockIcon />}
              onClick={async () => {
                try {
                  const ventas = await getVentas();
                  const ventasSesion = ventas.filter((v: any) => v.sesionCajaId === cajaActiva.id);
                  // Sumamos efectivo inicial + ventas de la sesión
                  const totalVentas = ventasSesion.reduce((sum: number, v: any) => sum + v.total, 0);
                  const estimado = cajaActiva.montoApertura + totalVentas;
                  setMontoCierre(Number(estimado.toFixed(2)));
                } catch (err) {
                  console.error(err);
                  // Fallback al saldo de apertura
                  setMontoCierre(cajaActiva.montoApertura);
                }
                setOpenCierreModal(true);
              }}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
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
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
          >
            Abrir Turno de Caja
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress sx={{ color: '#d97706' }} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Buscador inteligente */}
            <Box className="glass-panel fade-in shadow-sm" sx={{ p: 3, mb: 3, background: '#fff', border: '1px solid #eadec9' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                <TextField 
                  fullWidth 
                  variant="outlined" 
                  placeholder="Escribir nombre o escanear código de barras..." 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  sx={commonTextFieldSx}
                />
                <Button type="submit" variant="contained" sx={{ px: 4, borderRadius: 2, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}>
                  Buscar
                </Button>
              </form>
            </Box>

            {/* Productos sugeridos por vencimiento */}
            {productos.filter(p => {
              if (!p.fechaVencimiento) return false;
              const dias = Math.ceil((new Date(p.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return dias > 0 && dias <= 30 && p.stockActual > 0;
            }).length > 0 && (
              <Box className="glass-panel fade-in" sx={{ p: 2.5, mb: 3, border: '1px solid #eadec9', background: 'linear-gradient(to right, #fdfbf7, #fcfbfa)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📢 Sugerencias de Venta Directa (Liquidación por Vencer)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { height: '6px' } }}>
                  {productos.filter(p => {
                    if (!p.fechaVencimiento) return false;
                    const dias = Math.ceil((new Date(p.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    return dias > 0 && dias <= 30 && p.stockActual > 0;
                  }).map(prod => {
                    const dias = Math.ceil((new Date(prod.fechaVencimiento!).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    return (
                      <Box 
                        key={prod.id} 
                        onClick={() => addToCart(prod)}
                        sx={{ 
                          minWidth: '200px', 
                          p: 1.5, 
                          borderRadius: 3, 
                          bgcolor: '#fdfbf7', 
                          border: '1px solid #eadec9',
                          cursor: 'pointer',
                          '&:hover': { transform: 'scale(1.02)', borderColor: '#d97706', bgcolor: '#fff' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <Typography sx={{ color: '#4a3e3d', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.nombre}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography sx={{ color: '#d97706', fontWeight: 700, fontSize: '0.9rem' }}>S/ {prod.precioVenta.toFixed(2)}</Typography>
                          <Typography variant="caption" sx={{ bgcolor: '#fdf8f2', color: '#b45309', px: 1, py: 0.2, borderRadius: 1.5, fontWeight: 700, border: '1px solid #f5e6d3' }}>
                            Vence en {dias}d
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#4a3e3d' }}>
              Catálogo de Productos ({filteredProductos.length})
            </Typography>
            
            <Grid container spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
              {filteredProductos.map(prod => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prod.id}>
                  <Box 
                    className="glass-panel fade-in shadow-sm" 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer', 
                      background: '#fff',
                      border: '1px solid #eadec9',
                      opacity: prod.stockActual <= 0 ? 0.6 : 1,
                      transition: 'all 0.2s', 
                      '&:hover': prod.stockActual > 0 ? { transform: 'translateY(-4px)', borderColor: '#d97706' } : {} 
                    }}
                    onClick={() => addToCart(prod)}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#4a3e3d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.nombre}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#d97706', fontWeight: 700 }}>
                        S/ {prod.precioVenta.toFixed(2)}
                      </Typography>
                      {(currentRole.toLowerCase() === 'administrador' || currentRole.toLowerCase() === 'admin') && (
                        <Typography variant="caption" sx={{ color: prod.stockActual <= 5 ? '#dc2626' : '#8a7b6e', fontWeight: prod.stockActual <= 5 ? 700 : 500 }}>
                          Stock: {prod.stockActual}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
              {filteredProductos.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography sx={{ color: '#8a7b6e', textAlign: 'center', mt: 4 }}>
                    No se encontraron productos que coincidan con la búsqueda.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box className="glass-panel fade-in shadow-sm" sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '60vh', background: '#fff', border: '1px solid #eadec9' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4a3e3d' }}>Carrito de Venta</Typography>
              <Divider sx={{ borderColor: '#eadec9', mb: 2 }} />
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '35vh' }}>
                {cart.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography sx={{ color: '#4a3e3d', fontWeight: 600 }}>{item.nombre}</Typography>
                      <Typography variant="body2" sx={{ color: '#8a7b6e' }}>
                        {item.cantidad} x S/ {item.precioVenta.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: '#4a3e3d', fontWeight: 700 }}>S/ {(item.cantidad * item.precioVenta).toFixed(2)}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                {cart.length === 0 && (
                  <Typography sx={{ color: '#8a7b6e', textAlign: 'center', mt: 4 }}>
                    Agrega productos para empezar
                  </Typography>
                )}
              </Box>

              <Divider sx={{ borderColor: '#eadec9', my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8a7b6e' }}>Asociar Cliente (Opcional)</Typography>
                  <Button 
                    size="small" 
                    startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setOpenClienteModal(true)}
                    sx={{ textTransform: 'none', color: '#d97706', fontWeight: 700, p: 0, minWidth: 'auto', '&:hover': { background: 'transparent', color: '#b45309' } }}
                  >
                    Nuevo
                  </Button>
                </Box>
                <Select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  fullWidth
                  displayEmpty
                  size="small"
                  sx={{ color: '#4a3e3d', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eadec9' }, '& .MuiSvgIcon-root': { color: '#8a7b6e' } }}
                >
                  <MenuItem value="">-- Cliente Genérico (Público General) --</MenuItem>
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id.toString()}>{c.nombre} (DNI/RUC: {c.documento})</MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#8a7b6e', mb: 1 }}>Método de Pago</Typography>
                <Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ color: '#4a3e3d', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eadec9' }, '& .MuiSvgIcon-root': { color: '#8a7b6e' } }}
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TARJETA">Tarjeta</MenuItem>
                  <MenuItem value="CREDITO">Crédito</MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#4a3e3d' }}>Total a Pagar</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#d97706' }}>S/ {total.toFixed(2)}</Typography>
              </Box>

              <Button 
                variant="contained" 
                color="success" 
                size="large" 
                fullWidth 
                startIcon={<AddShoppingCartIcon />}
                onClick={processSale}
                disabled={cart.length === 0 || !cajaActiva}
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
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
        onClose={() => setOpenAperturaModal(false)}
        slotProps={{
          paper: {
            sx: {
              background: '#fcfbfa',
              border: '1px solid #eadec9',
              borderRadius: '16px',
              color: '#4a3e3d',
              minWidth: '350px'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#4a3e3d' }}>Apertura de Turno de Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8a7b6e', mb: 3 }}>
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
        <DialogActions sx={{ px: 3, py: 2, display: 'flex', gap: 2 }}>
          <Button onClick={() => setOpenAperturaModal(false)} sx={{ color: '#8a7b6e', flex: 1 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAbrirCaja} 
            variant="contained" 
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309', transform: 'none' }, py: 1.2, fontWeight: 600, flex: 1 }}
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
              background: '#fcfbfa',
              border: '1px solid #eadec9',
              borderRadius: '16px',
              color: '#4a3e3d',
              minWidth: '350px'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#4a3e3d' }}>Cierre de Turno de Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8a7b6e', mb: 3 }}>
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
          <Button onClick={() => setOpenCierreModal(false)} sx={{ color: '#8a7b6e', flex: 1 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCerrarCaja} 
            variant="contained" 
            color="error"
            sx={{ py: 1.2, fontWeight: 600, flex: 1, bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Registro Rápido de Cliente */}
      <Dialog 
        open={openClienteModal} 
        onClose={() => setOpenClienteModal(false)}
        slotProps={{
          paper: {
            sx: {
              background: '#fcfbfa',
              border: '1px solid #eadec9',
              borderRadius: '16px',
              color: '#4a3e3d',
              minWidth: '350px'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#4a3e3d' }}>Registro Rápido de Cliente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8a7b6e', mb: 3 }}>
            Registra un nuevo cliente. Si ya está registrado con su DNI/RUC, el sistema lo seleccionará automáticamente.
          </Typography>
          {clienteError && <Alert severity="error" sx={{ mb: 2 }}>{clienteError}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre Completo *"
              fullWidth
              variant="outlined"
              value={newClienteForm.nombre}
              onChange={(e) => setNewClienteForm(prev => ({ ...prev, nombre: e.target.value }))}
              sx={commonTextFieldSx}
            />
            <TextField
              label="Documento (DNI/RUC) *"
              fullWidth
              variant="outlined"
              value={newClienteForm.documento}
              onChange={(e) => setNewClienteForm(prev => ({ ...prev, documento: e.target.value }))}
              sx={commonTextFieldSx}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: 'flex', gap: 2 }}>
          <Button onClick={() => setOpenClienteModal(false)} sx={{ color: '#8a7b6e', flex: 1 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateCliente} 
            variant="contained" 
            sx={{ py: 1.2, fontWeight: 600, flex: 1, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Comprobante de Venta Exitoso */}
      <Dialog 
        open={openReceiptModal} 
        onClose={() => setOpenReceiptModal(false)}
        maxWidth="xs"
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
        <DialogTitle sx={{ fontWeight: 850, borderBottom: '1px solid #eadec9', pb: 2, color: '#4a3e3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>¡Venta Exitosa!</span>
          <Chip label={`ID: CP-000${completedSale?.id}`} color="success" variant="outlined" sx={{ borderColor: '#16a34a', color: '#16a34a', fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {completedSale && (
            <div className="space-y-4">
              <Box sx={{ bgcolor: '#fff', border: '1px solid #eadec9', borderRadius: '12px', p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#4a3e3d' }}>
                  Resumen de Boleta
                </Typography>
                <Divider sx={{ mb: 1.5, borderColor: '#f1efe9' }} />
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Fecha y Hora</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                      {new Date(completedSale.fechaHora).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Método de Pago</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                      {completedSale.metodoPago || 'EFECTIVO'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Cliente</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                      {completedSale.cliente?.nombre || 'Público General'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4a3e3d', mb: 1 }}>
                Artículos Vendidos
              </Typography>

              <Box sx={{ border: '1px solid #eadec9', borderRadius: '12px', bgcolor: '#fff', maxHeight: '150px', overflowY: 'auto', p: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eadec9' }}>
                      <th style={{ textAlign: 'left', fontSize: '11px', color: '#8a7b6e', paddingBottom: '4px' }}>Prod</th>
                      <th style={{ textAlign: 'center', fontSize: '11px', color: '#8a7b6e', paddingBottom: '4px' }}>Cant</th>
                      <th style={{ textAlign: 'right', fontSize: '11px', color: '#8a7b6e', paddingBottom: '4px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSale.detalleVenta?.map((d: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1efe9' }}>
                        <td style={{ fontSize: '12px', color: '#4a3e3d', padding: '6px 0' }}>
                          {d.producto?.nombre || `Producto #${d.productoId}`}
                        </td>
                        <td style={{ fontSize: '12px', color: '#4a3e3d', textAlign: 'center', padding: '6px 0' }}>
                          {d.cantidad}
                        </td>
                        <td style={{ fontSize: '12px', color: '#4a3e3d', fontWeight: 600, textAlign: 'right', padding: '6px 0' }}>
                          S/ {d.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: '1px dashed #eadec9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                  Total Cobrado
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#16a34a' }}>
                  S/ {completedSale.total.toFixed(2)}
                </Typography>
              </Box>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eadec9', px: 3, py: 2 }}>
          <Button onClick={() => setOpenReceiptModal(false)} sx={{ color: '#8a7b6e', textTransform: 'none', fontWeight: 600 }}>
            Entendido
          </Button>
          <Button 
            onClick={() => handlePrintInvoice(completedSale)} 
            variant="contained" 
            startIcon={<PrintIcon />}
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
          >
            Imprimir Boleta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
