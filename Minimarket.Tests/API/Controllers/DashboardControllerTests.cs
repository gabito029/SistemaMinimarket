using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Minimarket.API.Controllers;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class DashboardControllerTests
    {
        [Fact]
        public async Task GetResumen_ReturnsOkWithDashboardData()
        {
            // Arrange
            var connectionString = "Server=DESKTOP-TNME1G3;Database=DB_Minimarket_Test_Dashboard;Trusted_Connection=True;TrustServerCertificate=True;";
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseSqlServer(connectionString)
                .Options;

            using var context = new DbMinimarketContext(options);
            await context.Database.EnsureDeletedAsync();
            await context.Database.EnsureCreatedAsync();
            
            // Seed a Category
            var cat = new Categorium { Nombre = "Bebidas" };
            context.Categoria.Add(cat);
            await context.SaveChangesAsync();

            // Seed Products
            var p1 = new Producto { Nombre = "Cola", StockActual = 10, CategoriaId = cat.Id, FechaVencimiento = DateTime.Today.AddDays(10), PrecioVenta = 5, PrecioCosto = 3 };
            var p2 = new Producto { Nombre = "Fanta", StockActual = 5, CategoriaId = cat.Id, FechaVencimiento = DateTime.Today.AddDays(40), PrecioVenta = 6, PrecioCosto = 4 };
            context.Productos.AddRange(p1, p2);
            await context.SaveChangesAsync();

            // Seed Users and Caja
            var user = new Usuario { Nombre = "Admin", Username = "admin", Contrasena = "admin123", Rol = "Administrador" };
            context.Usuarios.Add(user);
            await context.SaveChangesAsync();

            var sesion = new SesionCaja { MontoApertura = 100, FechaApertura = DateTime.Now, UsuarioId = user.Id };
            context.SesionCajas.Add(sesion);
            await context.SaveChangesAsync();

            // Seed Sales
            var venta = new Ventum { Total = 50, Estado = "Completada", MetodoPago = "Efectivo", SesionCajaId = sesion.Id, FechaHora = DateTime.Now };
            context.Venta.Add(venta);
            await context.SaveChangesAsync();

            var det = new DetalleVentum { VentaId = venta.Id, ProductoId = p1.Id, Cantidad = 10, PrecioUnitario = 5, Subtotal = 50 };
            context.DetalleVenta.Add(det);

            await context.SaveChangesAsync();

            var controller = new DashboardController(context);

            // Act
            var result = await controller.GetResumen();

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);

            // Clean up
            await context.Database.EnsureDeletedAsync();
        }

        [Fact]
        public async Task AplicarOfertasVencimiento_UpdatesPricesCorrectly()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var cat = new Categorium { Id = 1, Nombre = "Bebidas" };
            context.Categoria.Add(cat);
            var p = new Producto { Id = 1, Nombre = "Expiring", StockActual = 10, CategoriaId = 1, FechaVencimiento = DateTime.Today.AddDays(5), PrecioVenta = 10, PrecioCosto = 5 };
            context.Productos.Add(p);
            await context.SaveChangesAsync();

            var controller = new DashboardController(context);

            // Act
            var result = await controller.AplicarOfertasVencimiento();

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);

            var updatedProduct = await context.Productos.FindAsync(1);
            updatedProduct!.PrecioVenta.Should().Be(5); // Should match PrecioCosto
        }
    }
}
