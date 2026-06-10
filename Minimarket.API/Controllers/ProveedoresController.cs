using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Minimarket.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedoresController : ControllerBase
    {
        private readonly DbMinimarketContext _context;

        public ProveedoresController(DbMinimarketContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProveedores()
        {
            var proveedors = await _context.Proveedors
                .Include(p => p.Compras)
                    .ThenInclude(c => c.DetalleCompras)
                        .ThenInclude(d => d.Producto)
                .Select(p => new {
                    p.Id,
                    p.Ruc,
                    p.RazonSocial,
                    p.Telefono,
                    p.Direccion,
                    Pedidos = p.Compras.Select(c => new {
                        c.Id,
                        c.NroDocumento,
                        c.Fecha,
                        c.Total,
                        Detalles = c.DetalleCompras.Select(d => new {
                            d.ProductoId,
                            ProductoNombre = d.Producto.Nombre,
                            d.Cantidad,
                            d.PrecioCosto
                        })
                    })
                })
                .ToListAsync();

            return Ok(proveedors);
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarCompra([FromBody] RegistrarCompraRequest request)
        {
            if (request == null || request.Detalles == null || !request.Detalles.Any())
            {
                return BadRequest("Datos de compra inválidos.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var compra = new Minimarket.Domain.Entities.Compra
                {
                    ProveedorId = request.ProveedorId,
                    Fecha = System.DateTime.Now,
                    NroDocumento = request.NroDocumento,
                    Total = 0
                };

                _context.Compras.Add(compra);
                await _context.SaveChangesAsync();

                decimal total = 0;
                foreach (var d in request.Detalles)
                {
                    var prod = await _context.Productos.FindAsync(d.ProductoId);
                    if (prod == null) return BadRequest($"Producto #{d.ProductoId} no existe.");

                    // Aumentar stock de producto
                    prod.StockActual += d.Cantidad;
                    // Opcional: Actualizar el precio de costo del producto si se indica uno nuevo
                    if (d.PrecioCosto > 0)
                    {
                        prod.PrecioCosto = d.PrecioCosto;
                    }

                    var detalle = new Minimarket.Domain.Entities.DetalleCompra
                    {
                        CompraId = compra.Id,
                        ProductoId = d.ProductoId,
                        Cantidad = d.Cantidad,
                        PrecioCosto = d.PrecioCosto
                    };

                    _context.DetalleCompras.Add(detalle);
                    total += d.Cantidad * d.PrecioCosto;
                }

                compra.Total = total;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(compra);
            }
            catch (System.Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
    }

    public class RegistrarCompraRequest
    {
        public int ProveedorId { get; set; }
        public string NroDocumento { get; set; } = string.Empty;
        public System.Collections.Generic.List<DetalleCompraRequest> Detalles { get; set; } = new();
    }

    public class DetalleCompraRequest
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioCosto { get; set; }
    }
}
