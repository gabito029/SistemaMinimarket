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
    public class InventarioService : IInventarioService
    {
        private readonly DbMinimarketContext _context;

        public InventarioService(DbMinimarketContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductoDTO>> ObtenerProductosAsync()
        {
            return await _context.Productos.Select(p => new ProductoDTO
            {
                Id = p.Id,
                CodigoBarras = p.CodigoBarras,
                Nombre = p.Nombre,
                PrecioCosto = p.PrecioCosto,
                PrecioVenta = p.PrecioVenta,
                StockActual = p.StockActual,
                StockMinimo = p.StockMinimo,
                CategoriaId = p.CategoriaId,
                FechaVencimiento = p.FechaVencimiento
            }).ToListAsync();
        }

        public async Task<ProductoDTO?> ObtenerProductoPorIdAsync(int id)
        {
            var p = await _context.Productos.FindAsync(id);
            if (p == null) return null;
            return new ProductoDTO { Id = p.Id, Nombre = p.Nombre, PrecioVenta = p.PrecioVenta, StockActual = p.StockActual, PrecioCosto = p.PrecioCosto, FechaVencimiento = p.FechaVencimiento };
        }

        public async Task<ProductoDTO?> ObtenerProductoPorCodigoAsync(string codigo)
        {
            var p = await _context.Productos.FirstOrDefaultAsync(x => x.CodigoBarras == codigo);
            if (p == null) return null;
            return new ProductoDTO { Id = p.Id, Nombre = p.Nombre, PrecioVenta = p.PrecioVenta, StockActual = p.StockActual, PrecioCosto = p.PrecioCosto, FechaVencimiento = p.FechaVencimiento };
        }

        public async Task<Producto> CrearProductoAsync(Producto producto)
        {
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            // Si el código de barras está vacío o es nulo, el sistema genera automáticamente un ID/Código predefinido
            if (string.IsNullOrWhiteSpace(producto.CodigoBarras))
            {
                producto.CodigoBarras = $"PROD-{producto.Id:D4}"; // Ej: PROD-0001, PROD-0002...
                await _context.SaveChangesAsync();
            }

            return producto;
        }

        public async Task<bool> ActualizarProductoAsync(int id, ProductoDTO dto)
        {
            var p = await _context.Productos.FindAsync(id);
            if (p == null) return false;
            
            p.CodigoBarras = dto.CodigoBarras;
            p.Nombre = dto.Nombre;
            p.PrecioCosto = dto.PrecioCosto;
            p.PrecioVenta = dto.PrecioVenta;
            p.StockMinimo = dto.StockMinimo;
            p.CategoriaId = dto.CategoriaId;
            p.FechaVencimiento = dto.FechaVencimiento;
            // No actualizamos StockActual aquí para evitar sobrescribir ventas/ajustes concurrentes.
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarProductoAsync(int id)
        {
            var p = await _context.Productos.FindAsync(id);
            if (p == null) return false;
            
            _context.Productos.Remove(p);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task ActualizarStockAsync(int productoId, int cantidad, string tipoAjuste, string justificacion)
        {
            var p = await _context.Productos.FindAsync(productoId);
            if (p != null)
            {
                p.StockActual += (tipoAjuste == "Ingreso" ? cantidad : -cantidad);
                _context.AjusteStocks.Add(new AjusteStock { ProductoId = productoId, Cantidad = cantidad, Tipo = tipoAjuste, Justificacion = justificacion, Fecha = DateTime.Now });
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Categorium>> ObtenerCategoriasAsync()
        {
            return await _context.Categoria.ToListAsync();
        }

        public async Task<Categorium> CrearCategoriaAsync(Categorium categoria)
        {
            _context.Categoria.Add(categoria);
            await _context.SaveChangesAsync();
            return categoria;
        }
    }
}
