import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions, Button, Grid, Divider
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { getVentas } from '../../services/api';

const SalesDashboard: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);

  // Filters
  const [filterMetodo, setFilterMetodo] = useState<string>('TODOS');
  const [filterFecha, setFilterFecha] = useState<string>('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await getVentas();
      // Ordenar por fecha descendente
      const sorted = data.sort((a: any, b: any) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
      setSales(sorted);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setOpenModal(true);
  };

  const handlePrintInvoice = (sale: any) => {
    if (!sale) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
          <div><span class="bold">Metodo Pago:</span> ${sale.MetodoPago || sale.metodoPago || 'EFECTIVO'}</div>
          <div><span class="bold">Estado:</span> ${sale.Estado || sale.estado || 'Completada'}</div>
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
                  <td>${d.producto?.nombre || `Prod #${d.productoId}`}</td>
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

  const filteredSales = sales.filter((sale: any) => {
    const matchMetodo = filterMetodo === 'TODOS' || (sale.metodoPago || sale.MetodoPago || '').toUpperCase() === filterMetodo.toUpperCase();
    const matchFecha = !filterFecha || new Date(sale.fechaHora).toISOString().split('T')[0] === filterFecha;
    return matchMetodo && matchFecha;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Top Title & Filters Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#4a3e3d', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptIcon fontSize="large" sx={{ color: '#d97706' }} /> Historial de Ventas
          </Typography>
          <Typography variant="body1" sx={{ color: '#8a7b6e' }}>
            Visualiza todas las transacciones realizadas y genera reportes de cobros.
          </Typography>
        </Box>

        {/* Filters Panel (Warm Light Card) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, bg: '#fff', border: '1px solid #eadec9', p: 1.5, borderRadius: '16px' }}>
          <div className="flex bg-[#fcfbfa] p-1 rounded-xl border border-[#eadec9]">
            {['TODOS', 'EFECTIVO', 'TARJETA', 'CREDITO'].map((m) => (
              <button 
                key={m}
                onClick={() => setFilterMetodo(m)}
                className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all ${filterMetodo === m ? 'bg-[#d97706] text-white shadow-sm' : 'text-[#8a7b6e] hover:text-[#4a3e3d]'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#fcfbfa] px-3 py-1 rounded-xl border border-[#eadec9]">
            <CalendarTodayIcon sx={{ color: '#8a7b6e', fontSize: 16 }} />
            <input 
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-semibold text-[#4a3e3d] cursor-pointer"
            />
            {filterFecha && (
              <button onClick={() => setFilterFecha('')} className="text-[10px] text-red-500 font-bold hover:text-red-700 pl-1">Limpiar</button>
            )}
          </div>
        </Box>
      </Box>

      {/* Main Table Card */}
      <TableContainer component={Paper} sx={{ 
        background: '#fff', 
        borderRadius: '16px',
        border: '1px solid #eadec9',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>ID Venta</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Fecha y Hora</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Cliente</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Vendedor</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Método de Pago</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }}>Estado</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }} align="right">Monto Cobrado</TableCell>
              <TableCell sx={{ color: '#8a7b6e', fontWeight: 600, borderBottom: '1px solid #eadec9' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  <CircularProgress sx={{ color: '#d97706' }} />
                </TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#8a7b6e', borderBottom: 0 }}>
                  No se encontraron ventas registradas con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : filteredSales.map((row) => {
              const metodo = row.metodoPago || row.MetodoPago || 'EFECTIVO';
              const estado = row.estado || row.Estado || 'Completada';
              const clienteNombre = row.cliente?.nombre || 'Público General';
              const vendedorNombre = row.sesionCaja?.usuario?.nombre || 'Administrador';
              return (
                <TableRow
                  key={row.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background 0.2s',
                    '&:hover': { background: '#fdfbf7' }
                  }}
                >
                  <TableCell sx={{ color: '#6b5e51', borderBottom: '1px solid #f1efe9', fontWeight: 700 }}>
                    #CP-000{row.id}
                  </TableCell>
                  <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9' }}>
                    {new Date(row.fechaHora).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9', fontWeight: 600 }}>
                    {clienteNombre}
                  </TableCell>
                  <TableCell sx={{ color: '#8a7b6e', borderBottom: '1px solid #f1efe9', fontSize: '0.85rem' }}>
                    {vendedorNombre}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <Chip 
                      label={metodo} 
                      size="small" 
                      sx={{ 
                        background: metodo === 'CREDITO' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(79, 70, 229, 0.12)', 
                        color: metodo === 'CREDITO' ? '#b45309' : '#4f46e5',
                        fontWeight: 650,
                        border: `1px solid ${metodo === 'CREDITO' ? '#eadec9' : 'rgba(79, 70, 229, 0.2)'}`
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <Chip 
                      label={estado} 
                      size="small" 
                      sx={{ 
                        background: estado === 'Completada' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)', 
                        color: estado === 'Completada' ? '#16a34a' : '#dc2626',
                        fontWeight: 600
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#4a3e3d', fontWeight: 700, borderBottom: '1px solid #f1efe9', fontSize: '0.95rem' }}>
                    S/ {row.total.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #f1efe9' }}>
                    <IconButton 
                      title="Ver Comprobante / Reporte"
                      onClick={() => handleViewDetails(row)}
                      sx={{ color: '#d97706', '&:hover': { color: '#b45309', background: 'rgba(217, 119, 6, 0.08)' } }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      title="Reimprimir Comprobante"
                      onClick={() => handlePrintInvoice(row)}
                      sx={{ color: '#8c7d70', '&:hover': { color: '#4a3e3d', background: 'rgba(140, 125, 112, 0.08)' } }}
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal: Detalle de Venta / Reporte */}
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
              borderRadius: '20px',
              color: '#4a3e3d',
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, borderBottom: '1px solid #eadec9', pb: 2, color: '#4a3e3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Detalle de Transacción</span>
          <Chip label={`ID: CP-000${selectedSale?.id}`} color="primary" variant="outlined" sx={{ borderColor: '#d97706', color: '#d97706', fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedSale && (
            <div className="space-y-4">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Fecha y Hora</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                    {new Date(selectedSale.fechaHora).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Método de Pago</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                    {selectedSale.metodoPago || selectedSale.MetodoPago || 'EFECTIVO'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Cliente</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                    {selectedSale.cliente?.nombre || 'Público General'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Vendedor (Cajero)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                    {selectedSale.sesionCaja?.usuario?.nombre || 'Administrador'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>ID Turno de Caja</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                    Caja #{selectedSale.sesionCajaId}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#8a7b6e', display: 'block' }}>Estado del Cobro</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: selectedSale.estado === 'Completada' ? '#16a34a' : '#dc2626' }}>
                    {selectedSale.estado || selectedSale.Estado || 'Completada'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ borderColor: '#eadec9', my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4a3e3d', mb: 1.5 }}>
                Artículos Vendidos
              </Typography>

              <TableContainer sx={{ border: '1px solid #eadec9', borderRadius: '12px', bgcolor: '#fff' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#fcfbfa' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }}>Producto</TableCell>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }} align="center">Cant</TableCell>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }} align="right">P. Unit</TableCell>
                      <TableCell sx={{ color: '#8a7b6e', fontWeight: 700 }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSale.detalleVenta?.map((d: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9' }}>
                          {d.producto?.nombre || `Producto #${d.productoId}`}
                        </TableCell>
                        <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9' }} align="center">
                          {d.cantidad}
                        </TableCell>
                        <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9' }} align="right">
                          S/ {d.precioUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ color: '#4a3e3d', borderBottom: '1px solid #f1efe9', fontWeight: 600 }} align="right">
                          S/ {d.subtotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px dashed #eadec9' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4a3e3d' }}>
                  Total Cobrado
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#d97706' }}>
                  S/ {selectedSale.total.toFixed(2)}
                </Typography>
              </Box>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eadec9', px: 3, py: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#8a7b6e', textTransform: 'none', fontWeight: 600 }}>
            Cerrar
          </Button>
          <Button 
            onClick={() => handlePrintInvoice(selectedSale)} 
            variant="contained" 
            startIcon={<PrintIcon />}
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
          >
            Reimprimir Boleta
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SalesDashboard;
