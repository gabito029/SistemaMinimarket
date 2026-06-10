using FluentAssertions;
using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.Infrastructure.Services
{
    public class VentasServiceTests
    {
        [Fact]
        public async Task RegistrarVentaAsync_DeberiaCrearVentaYReducirStock()
        {
            // Sqlite for Transaction support
            using var context = TestDbContextFactory.CreateSqliteContext();
            
            context.Categoria.Add(new Categorium { Id = 1, Nombre = "Cat 1" });
            context.Productos.Add(new Producto { Id = 1, Nombre = "Prod 1", PrecioVenta = 10, StockActual = 20, CategoriaId = 1, CodigoBarras = "111" });
            context.Clientes.Add(new Cliente { Id = 1, Nombre = "Cliente 1", Documento = "123" });
            context.SesionCajas.Add(new SesionCaja { Id = 1, MontoApertura = 100 });
            await context.SaveChangesAsync();

            var service = new VentasService(context);
            var dto = new VentaCrearDTO
            {
                ClienteId = 1,
                SesionCajaId = 1,
                MetodoPago = "Efectivo",
                Detalles = new List<DetalleVentaCrearDTO>
                {
                    new DetalleVentaCrearDTO { ProductoId = 1, Cantidad = 2 } // Subtotal = 20
                }
            };

            var venta = await service.RegistrarVentaAsync(dto);

            venta.Should().NotBeNull();
            venta.Total.Should().Be(20);
            
            var productoInfo = await context.Productos.FindAsync(1);
            productoInfo!.StockActual.Should().Be(18); // 20 - 2
            
            context.DetalleVenta.Should().HaveCount(1);
        }
    }
}
