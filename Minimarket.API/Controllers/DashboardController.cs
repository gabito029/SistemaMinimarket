using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Minimarket.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly DbMinimarketContext _context;

        public DashboardController(DbMinimarketContext context)
        {
            _context = context;
        }

        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen()
        {
            var hoy = DateTime.Today;
            var limiteVencimiento = hoy.AddDays(30);

            // 1. Tarjetas de Métricas (Igual al mockup del usuario)
            var ventasDelDia = await _context.Venta
                .Where(v => v.FechaHora >= hoy && v.Estado == "Completada")
                .SumAsync(v => (decimal?)v.Total) ?? 0m;

            var totalProductos = await _context.Productos.CountAsync();
            var totalProveedores = await _context.Proveedors.CountAsync(); // Mantener métrica internamente por si acaso

            var comprobantesAnulados = await _context.Venta
                .Where(v => v.Estado == "Anulada" || v.Estado == "Cancelada")
                .CountAsync();

            var ventasRealizadas = await _context.Venta
                .Where(v => v.Estado == "Completada")
                .CountAsync();

            var totalVentasAcumuladas = await _context.Venta
                .Where(v => v.Estado == "Completada")
                .SumAsync(v => (decimal?)v.Total) ?? 0m;

            // 2. Gráfico 1: Productos Próximos a Vencer (Días restantes)
            var productosPorVencer = await _context.Productos
                .Where(p => p.FechaVencimiento != null && p.FechaVencimiento >= hoy && p.FechaVencimiento <= limiteVencimiento)
                .OrderBy(p => p.FechaVencimiento)
                .Select(p => new
                {
                    Nombre = p.Nombre,
                    DiasRestantes = EF.Functions.DateDiffDay(hoy, p.FechaVencimiento.Value)
                })
                .Take(10) // Mostrar los 10 más urgentes
                .ToListAsync();

            // 3. Gráfico 2: Top 10 Productos Más Vendidos
            var topProductos = await _context.DetalleVenta
                .Include(dv => dv.Venta)
                .Include(dv => dv.Producto)
                .Where(dv => dv.Venta.Estado == "Completada")
                .GroupBy(dv => dv.Producto.Nombre)
                .Select(g => new
                {
                    Name = g.Key,
                    Value = g.Sum(x => x.Cantidad)
                })
                .OrderByDescending(x => x.Value)
                .Take(10)
                .ToListAsync();

            // 3b. Productos con bajo stock (Stock < 15)
            var productosBajoStock = await _context.Productos
                .Where(p => p.StockActual < 15)
                .OrderBy(p => p.StockActual)
                .Select(p => new
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    StockActual = p.StockActual,
                    StockMinimo = p.StockMinimo,
                    Categoria = p.Categoria != null ? p.Categoria.Nombre : "General"
                })
                .Take(10)
                .ToListAsync();

            // 4. Gráfico 3: Evolución de Ventas (Semanal, Mensual, Anual)
            
            // --- Semanal (Lunes a Domingo de la semana actual) ---
            var startOfWeek = hoy.AddDays(-(int)hoy.DayOfWeek + (int)DayOfWeek.Monday);
            var endOfWeek = startOfWeek.AddDays(7);
            var ventasSemanaQuery = await _context.Venta
                .Where(v => v.FechaHora >= startOfWeek && v.FechaHora < endOfWeek && v.Estado == "Completada")
                .Select(v => new { v.FechaHora, v.Total })
                .ToListAsync();

            var diasSemana = new[] { "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom" };
            var datosSemanal = new List<object>();
            for (int i = 0; i < 7; i++)
            {
                var targetDate = startOfWeek.AddDays(i);
                var totalDia = ventasSemanaQuery
                    .Where(v => v.FechaHora.Date == targetDate.Date)
                    .Sum(v => v.Total);
                datosSemanal.Add(new { label = diasSemana[i], total = totalDia });
            }

            // --- Mensual (Semanas del mes actual) ---
            var startOfMonth = new DateTime(hoy.Year, hoy.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);
            var ventasMesQuery = await _context.Venta
                .Where(v => v.FechaHora >= startOfMonth && v.FechaHora < endOfMonth && v.Estado == "Completada")
                .Select(v => new { v.FechaHora, v.Total })
                .ToListAsync();

            var datosMensual = new List<object>();
            for (int i = 0; i < 4; i++)
            {
                var startOfPeriod = startOfMonth.AddDays(i * 7);
                var endOfPeriod = (i == 3) ? endOfMonth : startOfPeriod.AddDays(7);
                var totalPeriodo = ventasMesQuery
                    .Where(v => v.FechaHora >= startOfPeriod && v.FechaHora < endOfPeriod)
                    .Sum(v => v.Total);
                datosMensual.Add(new { label = $"Semana {i + 1}", total = totalPeriodo });
            }

            // --- Anual (Meses del año actual) ---
            var startOfYear = new DateTime(hoy.Year, 1, 1);
            var endOfYear = startOfYear.AddYears(1);
            var ventasAnioQuery = await _context.Venta
                .Where(v => v.FechaHora >= startOfYear && v.FechaHora < endOfYear && v.Estado == "Completada")
                .Select(v => new { v.FechaHora, v.Total })
                .ToListAsync();

            var meses = new[] { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };
            var datosAnual = new List<object>();
            for (int i = 0; i < 12; i++)
            {
                var totalMes = ventasAnioQuery
                    .Where(v => v.FechaHora.Month == (i + 1))
                    .Sum(v => v.Total);
                datosAnual.Add(new { label = meses[i], total = totalMes });
            }

            return Ok(new
            {
                Métricas = new
                {
                    VentasDelDia = ventasDelDia,
                    TotalProductos = totalProductos,
                    TotalProveedores = totalProveedores,
                    ComprobantesAnulados = comprobantesAnulados,
                    VentasRealizadas = ventasRealizadas,
                    TotalVentasAcumuladas = totalVentasAcumuladas
                },
                ProductosPorVencer = productosPorVencer,
                ProductosBajoStock = productosBajoStock,
                TopProductos = topProductos,
                GraficoVentas = new
                {
                    Semanal = datosSemanal,
                    Mensual = datosMensual,
                    Anual = datosAnual
                }
            });
        }

        [HttpPost("aplicar-ofertas-vencimiento")]
        public async Task<IActionResult> AplicarOfertasVencimiento()
        {
            var hoy = DateTime.Today;
            var limiteVencimiento = hoy.AddDays(30);

            var productos = await _context.Productos
                .Where(p => p.FechaVencimiento != null && p.FechaVencimiento >= hoy && p.FechaVencimiento <= limiteVencimiento && p.PrecioVenta > p.PrecioCosto)
                .ToListAsync();

            int count = 0;
            foreach (var p in productos)
            {
                p.PrecioVenta = p.PrecioCosto; // Vender a precio de costo
                count++;
            }

            if (count > 0)
            {
                await _context.SaveChangesAsync();
                
                var log = new Minimarket.Domain.Entities.LogAuditorium
                {
                    Accion = "Aplicar Ofertas Vencimiento",
                    FechaHora = DateTime.Now,
                    Detalles = $"Se aplicó oferta de liquidación (precio venta = precio costo) a {count} productos por vencer."
                };
                _context.LogAuditoria.Add(log);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Count = count });
        }
    }
}
