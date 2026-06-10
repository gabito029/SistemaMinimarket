using FluentAssertions;
using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.Infrastructure.Services
{
    public class InventarioServiceTests
    {
        [Fact]
        public async Task ObtenerProductosAsync_DeberiaRetornarLista()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            context.Productos.Add(new Producto { Nombre = "Prod 1", CodigoBarras = "111", CategoriaId = 1 });
            context.Productos.Add(new Producto { Nombre = "Prod 2", CodigoBarras = "222", CategoriaId = 1 });
            await context.SaveChangesAsync();
            var service = new InventarioService(context);

            var productos = await service.ObtenerProductosAsync();

            productos.Should().HaveCount(2);
        }

        [Fact]
        public async Task CrearProductoAsync_DeberiaGuardarEnBd()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var service = new InventarioService(context);
            var nuevoProducto = new Producto { Nombre = "Nuevo", CodigoBarras = "333", CategoriaId = 1 };

            var resultado = await service.CrearProductoAsync(nuevoProducto);

            resultado.Id.Should().BeGreaterThan(0);
            context.Productos.Should().HaveCount(1);
        }

        [Fact]
        public async Task ActualizarStockAsync_DeberiaAumentarYRegistrarAjuste_CuandoEsIngreso()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var producto = new Producto { Id = 1, Nombre = "Prod 1", CodigoBarras = "111", StockActual = 10, CategoriaId = 1 };
            context.Productos.Add(producto);
            await context.SaveChangesAsync();
            var service = new InventarioService(context);

            await service.ActualizarStockAsync(1, 5, "Ingreso", "Compra de mercaderia");

            var prodActualizado = await context.Productos.FindAsync(1);
            prodActualizado!.StockActual.Should().Be(15);
            context.AjusteStocks.Should().HaveCount(1);
            context.AjusteStocks.First().Cantidad.Should().Be(5);
        }
        
        [Fact]
        public async Task EliminarProductoAsync_DeberiaRemoverDeBd()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var producto = new Producto { Id = 1, Nombre = "Prod 1", CodigoBarras = "111", StockActual = 10, CategoriaId = 1 };
            context.Productos.Add(producto);
            await context.SaveChangesAsync();
            var service = new InventarioService(context);
            
            var result = await service.EliminarProductoAsync(1);
            
            result.Should().BeTrue();
            context.Productos.Should().BeEmpty();
        }
    }
}
