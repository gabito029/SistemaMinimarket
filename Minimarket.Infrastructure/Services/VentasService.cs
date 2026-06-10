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

        public async Task<IEnumerable<VentaDTO>> ObtenerVentasAsync()
        {
            var ventas = await _context.Venta
                .Include(v => v.DetalleVenta).ThenInclude(d => d.Producto)
                .Include(v => v.SesionCaja).ThenInclude(s => s.Usuario)
                .Include(v => v.Cliente)
                .ToListAsync();

            return ventas.Select(MapToDTO);
        }

        public async Task<VentaDTO?> ObtenerVentaPorIdAsync(int id)
        {
            var venta = await _context.Venta
                .Include(v => v.DetalleVenta).ThenInclude(d => d.Producto)
                .Include(v => v.SesionCaja).ThenInclude(s => s.Usuario)
                .Include(v => v.Cliente)
                .FirstOrDefaultAsync(v => v.Id == id);

            return venta == null ? null : MapToDTO(venta);
        }

        public async Task<VentaDTO> RegistrarVentaAsync(VentaCrearDTO ventaDto)
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

                var fullVenta = await ObtenerVentaPorIdAsync(venta.Id);
                return fullVenta ?? MapToDTO(venta);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static VentaDTO MapToDTO(Ventum v)
        {
            return new VentaDTO
            {
                Id = v.Id,
                FechaHora = v.FechaHora,
                MetodoPago = v.MetodoPago,
                Estado = v.Estado,
                Total = v.Total,
                SesionCajaId = v.SesionCajaId,
                Cliente = v.Cliente == null ? null : new VentaClienteDTO
                {
                    Id = v.Cliente.Id,
                    Nombre = v.Cliente.Nombre,
                    Documento = v.Cliente.Documento
                },
                SesionCaja = v.SesionCaja == null ? null : new VentaSesionCajaDTO
                {
                    Id = v.SesionCaja.Id,
                    Usuario = v.SesionCaja.Usuario == null ? null : new VentaUsuarioDTO
                    {
                        Id = v.SesionCaja.Usuario.Id,
                        Nombre = v.SesionCaja.Usuario.Nombre,
                        Username = v.SesionCaja.Usuario.Username
                    }
                },
                DetalleVenta = v.DetalleVenta.Select(d => new VentaDetalleDTO
                {
                    ProductoId = d.ProductoId,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal,
                    Producto = d.Producto == null ? null : new VentaProductoDTO
                    {
                        Id = d.Producto.Id,
                        Nombre = d.Producto.Nombre,
                        PrecioVenta = d.Producto.PrecioVenta
                    }
                }).ToList()
            };
        }
    }
}
