using FluentAssertions;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using PruebrasIntegracion.Fixtures;

namespace PruebrasIntegracion.Integration
{
    public class InventarioIntegrationTests : IClassFixture<SqlServerContainerFixture>
    {
        private readonly SqlServerContainerFixture _fixture;
        private readonly InventarioService _inventarioService;

        public InventarioIntegrationTests(SqlServerContainerFixture fixture)
        {
            _fixture = fixture;
            _inventarioService = new InventarioService(_fixture.DbContext);
        }

        [Fact]
        public async Task CrearProducto_DebeGuardarEnBaseDatos()
        {
            // Arrange
            var categoria = new Categorium { Nombre = "Bebidas" };
            var categoriaCreada = await _inventarioService.CrearCategoriaAsync(categoria);

            var producto = new Producto
            {
                CodigoBarras = "7891234567890",
                Nombre = "Coca Cola 2L",
                PrecioCosto = 5.00m,
                PrecioVenta = 8.50m,
                StockActual = 100,
                StockMinimo = 20,
                CategoriaId = categoriaCreada.Id,
                FechaVencimiento = DateTime.Now.AddYears(1)
            };

            // Act
            var productoCreado = await _inventarioService.CrearProductoAsync(producto);

            // Assert
            productoCreado.Should().NotBeNull();
            productoCreado.Id.Should().BeGreaterThan(0);
            productoCreado.Nombre.Should().Be("Coca Cola 2L");
            productoCreado.CodigoBarras.Should().Be("7891234567890");

            // Verificar que persista en la BD
            var productoRecuperado = await _inventarioService.ObtenerProductoPorIdAsync(productoCreado.Id);
            productoRecuperado.Should().NotBeNull();
            productoRecuperado!.Nombre.Should().Be("Coca Cola 2L");
        }

        [Fact]
        public async Task ObtenerProductos_DebeRetornarTodosLosProductosGuardados()
        {
            // Arrange
            var categoria = new Categorium { Nombre = "Alimentos" };
            var categoriaCreada = await _inventarioService.CrearCategoriaAsync(categoria);

            var producto1 = new Producto
            {
                CodigoBarras = "1234567890001",
                Nombre = "Pan Integral",
                PrecioCosto = 2.00m,
                PrecioVenta = 3.50m,
                StockActual = 50,
                StockMinimo = 10,
                CategoriaId = categoriaCreada.Id
            };

            var producto2 = new Producto
            {
                CodigoBarras = "1234567890002",
                Nombre = "Leche Fresca",
                PrecioCosto = 1.50m,
                PrecioVenta = 2.50m,
                StockActual = 30,
                StockMinimo = 5,
                CategoriaId = categoriaCreada.Id
            };

            await _inventarioService.CrearProductoAsync(producto1);
            await _inventarioService.CrearProductoAsync(producto2);

            // Act
            var productos = await _inventarioService.ObtenerProductosAsync();

            // Assert
            productos.Should().NotBeEmpty();
            productos.Count().Should().BeGreaterThanOrEqualTo(2);
            productos.Should().Contain(p => p.Nombre == "Pan Integral");
            productos.Should().Contain(p => p.Nombre == "Leche Fresca");
        }

        [Fact]
        public async Task ActualizarStock_DebeModificarLaCantidadCorrectamente()
        {
            // Arrange
            var categoria = new Categorium { Nombre = "Lácteos" };
            var categoriaCreada = await _inventarioService.CrearCategoriaAsync(categoria);

            var producto = new Producto
            {
                CodigoBarras = "9876543210001",
                Nombre = "Queso Cheddar",
                PrecioCosto = 10.00m,
                PrecioVenta = 15.00m,
                StockActual = 20,
                StockMinimo = 5,
                CategoriaId = categoriaCreada.Id
            };

            var productoCreado = await _inventarioService.CrearProductoAsync(producto);
            var stockInicial = productoCreado.StockActual;

            // Act
            await _inventarioService.ActualizarStockAsync(
                productoCreado.Id,
                cantidad: 10,
                tipoAjuste: "Ingreso",
                justificacion: "Compra a proveedor"
            );

            // Assert
            var productoActualizado = await _inventarioService.ObtenerProductoPorIdAsync(productoCreado.Id);
            productoActualizado.Should().NotBeNull();
            productoActualizado!.StockActual.Should().Be(stockInicial + 10);
        }
    }
}
