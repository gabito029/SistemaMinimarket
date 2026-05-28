using Microsoft.EntityFrameworkCore;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Infrastructure.Services
{
    public class VentasService : IVentasService
    {
        private readonly DbMinimarketContext _context;

        public VentasService(DbMinimarketContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ventum>> ObtenerVentasAsync()
        {
            return await _context.Venta.Include(v => v.DetalleVenta).ToListAsync();
        }

        public async Task<Ventum?> ObtenerVentaPorIdAsync(int id)
        {
            return await _context.Venta.Include(v => v.DetalleVenta).FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<Ventum> RegistrarVentaAsync(VentaCrearDTO ventaDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var venta = new Ventum
                {
                    FechaHora = DateTime.Now,
                    SesionCajaId = ventaDto.SesionCajaId,
                    ClienteId = ventaDto.ClienteId,
                    MetodoPago = ventaDto.MetodoPago,
                    Estado = "Completada",
                    Total = 0
                };

                _context.Venta.Add(venta);
                await _context.SaveChangesAsync();

                decimal total = 0;
                foreach (var d in ventaDto.Detalles)
                {
                    var p = await _context.Productos.FindAsync(d.ProductoId);
                    if (p == null || p.StockActual < d.Cantidad) throw new Exception($"Stock insuficiente para {d.ProductoId}");
                    
                    p.StockActual -= d.Cantidad;
                    var detalle = new DetalleVentum
                    {
                        VentaId = venta.Id,
                        ProductoId = d.ProductoId,
                        Cantidad = d.Cantidad,
                        PrecioUnitario = p.PrecioVenta,
                        Subtotal = d.Cantidad * p.PrecioVenta
                    };
                    _context.DetalleVenta.Add(detalle);
                    total += detalle.Subtotal;
                }
                venta.Total = total;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return venta;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
