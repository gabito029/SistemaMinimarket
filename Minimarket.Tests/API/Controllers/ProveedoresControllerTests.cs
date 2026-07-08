using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Minimarket.API.Controllers;
using Minimarket.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class ProveedoresControllerTests
    {
        [Fact]
        public async Task GetProveedores_ReturnsOkWithSupplierList()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var proveedor = new Proveedor { Id = 1, RazonSocial = "Distribuidora Test", Ruc = "12345678901", Telefono = "999888777", Direccion = "Calle Falsa 123" };
            context.Proveedors.Add(proveedor);
            await context.SaveChangesAsync();

            var controller = new ProveedoresController(context);

            // Act
            var result = await controller.GetProveedores();

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task RegistrarCompra_ValidRequest_ReturnsOkAndIncrementsStock()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var cat = new Categorium { Id = 1, Nombre = "Bebidas" };
            context.Categoria.Add(cat);
            var prod = new Producto { Id = 1, Nombre = "Stock Product", StockActual = 10, CategoriaId = 1, PrecioCosto = 2, PrecioVenta = 4 };
            context.Productos.Add(prod);
            var prov = new Proveedor { Id = 1, RazonSocial = "Distribuidora Test", Ruc = "12345678901" };
            context.Proveedors.Add(prov);
            await context.SaveChangesAsync();

            var controller = new ProveedoresController(context);
            var request = new RegistrarCompraRequest
            {
                ProveedorId = 1,
                NroDocumento = "FAC-001",
                Detalles = new List<DetalleCompraRequest>
                {
                    new DetalleCompraRequest { ProductoId = 1, Cantidad = 15, PrecioCosto = 3m }
                }
            };

            // Act
            var result = await controller.RegistrarCompra(request);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);

            var updatedProd = await context.Productos.FindAsync(1);
            updatedProd!.StockActual.Should().Be(25); // 10 + 15
            updatedProd.PrecioCosto.Should().Be(3m); // updated to new cost
        }

        [Fact]
        public async Task RegistrarCompra_NullOrEmptyDetails_ReturnsBadRequest()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var controller = new ProveedoresController(context);
            var request = new RegistrarCompraRequest
            {
                ProveedorId = 1,
                NroDocumento = "FAC-001",
                Detalles = new List<DetalleCompraRequest>()
            };

            // Act
            var result = await controller.RegistrarCompra(request);

            // Assert
            var badResult = result as BadRequestObjectResult;
            badResult.Should().NotBeNull();
            badResult!.StatusCode.Should().Be(400);
        }

        [Fact]
        public async Task RegistrarCompra_NonExistingProduct_ReturnsBadRequest()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var prov = new Proveedor { Id = 1, RazonSocial = "Distribuidora Test", Ruc = "12345678901" };
            context.Proveedors.Add(prov);
            await context.SaveChangesAsync();

            var controller = new ProveedoresController(context);
            var request = new RegistrarCompraRequest
            {
                ProveedorId = 1,
                NroDocumento = "FAC-001",
                Detalles = new List<DetalleCompraRequest>
                {
                    new DetalleCompraRequest { ProductoId = 999, Cantidad = 10, PrecioCosto = 5 }
                }
            };

            // Act
            var result = await controller.RegistrarCompra(request);

            // Assert
            var badResult = result as BadRequestObjectResult;
            badResult.Should().NotBeNull();
            badResult!.StatusCode.Should().Be(400);
        }
    }
}
