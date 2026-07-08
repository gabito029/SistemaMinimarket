import React, { useState, useEffect } from 'react';
import { 
  Box, Button, CircularProgress, Alert 
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { getDashboardResumen, aplicarOfertasVencimiento } from '../services/api';

const WARM_COLORS = [
  '#d97706', // Amber
  '#ea580c', // Orange
  '#b45309', // Dark Amber
  '#db2777', // Pink
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#dc2626', // Red
  '#7c3aed'  // Purple
];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [desde, setDesde] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [hasta, setHasta] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [periodo, setPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('mensual');

  const loadData = async () => {
    try {
      const resumen = await getDashboardResumen();
      setData(resumen);
    } catch (error) {
      console.error("Error cargando el dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAplicarOfertas = async () => {
    if (!window.confirm("¿Estás seguro de que deseas poner en oferta todos los productos que vencen en los próximos 30 días? Esta acción modificará sus precios de venta en el catálogo.")) {
      return;
    }

    setActionLoading(true);
    setSuccessMessage('');
    try {
      const result = await aplicarOfertasVencimiento();
      setSuccessMessage(`¡Éxito! Se han actualizado ${result.count || 0} productos a precio de costo.`);
      await loadData();
    } catch (error) {
      console.error("Error al aplicar ofertas de vencimiento:", error);
      alert("Hubo un error al aplicar las ofertas.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress sx={{ color: '#d97706' }} />
      </Box>
    );
  }

  const getGraficoVentasData = () => {
    if (!data?.graficoVentas) return [];
    switch (periodo) {
      case 'semanal': return data.graficoVentas.semanal;
      case 'anual': return data.graficoVentas.anual;
      case 'mensual':
      default:
        return data.graficoVentas.mensual;
    }
  };

  const metricas = data?.métricas || {
    ventasDelDia: 0,
    totalProductos: 0,
    totalProveedores: 0,
    comprobantesAnulados: 0,
    ventasRealizadas: 0,
    totalVentasAcumuladas: 0
  };

  return (
    <Box className="fade-in space-y-6 pb-10 text-slate-800">
      
      {/* Top Bar with Title and Date Pickers */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4a3e3d]">Panel de Control</h1>
          <p className="text-sm text-[#8a7b6e]">Resumen de ventas y analítica comercial de la tienda.</p>
        </div>

        {/* Date Filter Inputs (Warm Light Design) */}
        <div className="flex items-center gap-3 bg-white border border-[#eadec9] p-3 rounded-2xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#8a7b6e] tracking-wider mb-1">Desde</span>
            <input 
              type="date" 
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="bg-transparent text-[#4a3e3d] border-0 outline-none text-xs font-semibold focus:ring-0 w-32 cursor-pointer"
            />
          </div>
          <div className="h-8 w-[1px] bg-[#eadec9]" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#8a7b6e] tracking-wider mb-1">Hasta</span>
            <input 
              type="date" 
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="bg-transparent text-[#4a3e3d] border-0 outline-none text-xs font-semibold focus:ring-0 w-32 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <Alert 
          icon={<CheckCircleIcon className="text-[#16a34a]" />} 
          className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-xl"
        >
          {successMessage}
        </Alert>
      )}

      {/* Row of Metric Cards (5 Columns Grid, Warm Light/Pastel Colors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Productos en Tienda (Warm Gold/Amber) */}
        <div className="bg-[#fdfbf7] border border-[#eadec9] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7b6e]">Productos en Tienda</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <StorefrontIcon fontSize="small" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-[#4a3e3d]">{metricas.totalProductos}</h2>
            <p className="text-[11px] text-[#8a7b6e] mt-1 font-medium">Artículos catalogados</p>
          </div>
        </div>

        {/* Card 2: Proveedores (Warm Indigo/Blue) */}
        <div className="bg-[#fdfbf7] border border-[#eadec9] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7b6e]">Proveedores</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <LocalShippingIcon fontSize="small" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-[#4a3e3d]">{metricas.totalProveedores}</h2>
            <p className="text-[11px] text-[#8a7b6e] mt-1 font-medium">Socios registrados</p>
          </div>
        </div>

        {/* Card 3: Ventas Realizadas (Warm Rose/Pink) */}
        <div className="bg-[#fdfbf7] border border-[#eadec9] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7b6e]">Ventas Realizadas</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <ShoppingBagIcon fontSize="small" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-[#4a3e3d]">{metricas.ventasRealizadas}</h2>
            <p className="text-[11px] text-[#8a7b6e] mt-1 font-medium">Órdenes completadas</p>
          </div>
        </div>

        {/* Card 4: Ventas del Día (Warm Sky/Blue) */}
        <div className="bg-[#fdfbf7] border border-[#eadec9] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7b6e]">Ventas del Día</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <AttachMoneyIcon fontSize="small" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-[#4a3e3d]">S/ {metricas.ventasDelDia.toFixed(2)}</h2>
            <p className="text-[11px] text-[#8a7b6e] mt-1 font-medium">Ingresos de hoy</p>
          </div>
        </div>

        {/* Card 5: Total Ventas Acumuladas (Warm Green) */}
        <div className="bg-[#fdfbf7] border border-[#eadec9] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7b6e]">Total Acumulado</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUpIcon fontSize="small" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-[#4a3e3d]">S/ {metricas.totalVentasAcumuladas.toFixed(2)}</h2>
            <p className="text-[11px] text-[#8a7b6e] mt-1 font-medium">Total histórico</p>
          </div>
        </div>

      </div>

      {/* Row 1: Sales Chart (2/3 width) and Top 10 Pie Chart (1/3 width) in a grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Card (Ventas Timeline Chart) - Warm light theme */}
        <div className="bg-white border border-[#eadec9] rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#4a3e3d] uppercase tracking-wide">Registro e Historial de Ventas</h3>
              <p className="text-xs text-[#8a7b6e]">Curva de ingresos generados en la tienda en el periodo.</p>
            </div>

            {/* Selector de Periodo */}
            <div className="flex bg-[#fcfbfa] p-1.5 rounded-xl border border-[#eadec9] shadow-inner">
              <button 
                onClick={() => setPeriodo('semanal')}
                className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${periodo === 'semanal' ? 'bg-[#d97706] text-white shadow-md' : 'text-[#8a7b6e] hover:text-[#4a3e3d]'}`}
              >
                Semanal
              </button>
              <button 
                onClick={() => setPeriodo('mensual')}
                className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${periodo === 'mensual' ? 'bg-[#d97706] text-white shadow-md' : 'text-[#8a7b6e] hover:text-[#4a3e3d]'}`}
              >
                Mensual
              </button>
              <button 
                onClick={() => setPeriodo('anual')}
                className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${periodo === 'anual' ? 'bg-[#d97706] text-white shadow-md' : 'text-[#8a7b6e] hover:text-[#4a3e3d]'}`}
              >
                Anual
              </button>
            </div>
          </div>

          {/* Recharts AreaChart (Warm Amber Palette) */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getGraficoVentasData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1efe9" />
                <XAxis dataKey="label" stroke="#8a7b6e" fontSize={11} tickLine={false} />
                <YAxis stroke="#8a7b6e" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#fff', borderColor: '#eadec9', borderRadius: '12px', color: '#4a3e3d', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  labelFormatter={(label) => `Periodo: ${label}`}
                />
                <Area type="monotone" dataKey="total" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Top 10 Productos Más Vendidos */}
        <div className="bg-white border border-[#eadec9] rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-lg font-bold text-[#4a3e3d] uppercase tracking-wide">Productos Más Vendidos</h3>
            <p className="text-xs text-[#8a7b6e]">Top 10 artículos con mayor rotación.</p>
          </div>

          <div className="h-72 w-full flex flex-col justify-between">
            {data?.topProductos?.length === 0 ? (
              <div className="w-full h-full flex justify-center items-center text-[#8a7b6e] text-sm">
                No hay registros de ventas procesadas.
              </div>
            ) : (
              <>
                <div className="h-[55%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.topProductos}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data?.topProductos?.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={WARM_COLORS[index % WARM_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#fff', borderColor: '#eadec9', borderRadius: '12px', color: '#4a3e3d', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                        formatter={(value) => [`${value} unidades`, 'Cantidad']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full max-h-32 overflow-y-auto pr-1 text-[10px] space-y-1.5 mt-2">
                  {data?.topProductos?.map((item: any, idx: number) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: WARM_COLORS[idx % WARM_COLORS.length] }} />
                        <span className="truncate text-[#4a3e3d] font-medium">{item.name}</span>
                      </div>
                      <span className="text-[#8a7b6e] font-semibold pl-1">{item.value} u.</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Expiring Products List and Low Stock Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* List A: Productos por Vencer */}
        <div className="bg-white border border-[#eadec9] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#4a3e3d] uppercase tracking-wide">Productos Próximos a Vencer</h3>
              <p className="text-xs text-[#8a7b6e]">Listado de productos que vencerán en los próximos 30 días.</p>
            </div>
            
            <Button
              variant="contained"
              disabled={actionLoading || !data?.productosPorVencer?.length}
              onClick={handleAplicarOfertas}
              startIcon={<FlashOnIcon />}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl py-1.5 px-3 shadow-md text-xs normal-case font-bold transition-all duration-300 disabled:opacity-40"
              style={{ background: 'linear-gradient(to right, #d97706, #ea580c)' }}
            >
              Aplicar Ofertas (A Costo)
            </Button>
          </div>

          <div className="overflow-y-auto max-h-72 pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#eadec9] text-[#8a7b6e]">
                  <th className="pb-3 font-semibold">Producto</th>
                  <th className="pb-3 font-semibold text-right">Urgencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1efe9]">
                {data?.productosPorVencer?.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-[#8a7b6e]">No hay productos próximos a vencer.</td>
                  </tr>
                ) : (
                  data?.productosPorVencer?.map((prod: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#fdfbf7] transition-all">
                      <td className="py-3 font-medium text-[#4a3e3d]">{prod.nombre}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          prod.diasRestantes <= 7 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {prod.diasRestantes <= 0 ? 'Vencido' : `Vence en ${prod.diasRestantes} días`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* List B: Productos con Bajo Stock (Stock < 15) */}
        <div className="bg-white border border-[#eadec9] rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#4a3e3d] uppercase tracking-wide">Productos Próximos a Agotarse</h3>
            <p className="text-xs text-[#8a7b6e]">Existencias críticas de productos con stock menor a 15 unidades.</p>
          </div>

          <div className="overflow-y-auto max-h-72 pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#eadec9] text-[#8a7b6e]">
                  <th className="pb-3 font-semibold">Producto</th>
                  <th className="pb-3 font-semibold">Categoría</th>
                  <th className="pb-3 font-semibold text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1efe9]">
                {data?.productosBajoStock?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-[#8a7b6e]">No hay productos con stock menor a 15.</td>
                  </tr>
                ) : (
                  data?.productosBajoStock?.map((prod: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#fdfbf7] transition-all">
                      <td className="py-3 font-medium text-[#4a3e3d]">{prod.nombre}</td>
                      <td className="py-3 text-[#8a7b6e]">{prod.categoria}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          prod.stockActual <= 5 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {prod.stockActual} unidades
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </Box>
  );
};

export default Dashboard;
