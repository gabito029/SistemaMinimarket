using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using Minimarket.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Services
{
    [TestClass]
    public class VentasServiceTests
    {
        private DbMinimarketContext GetContext()
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            return new DbMinimarketContext(options);
        }

        [TestMethod]
        public async Task ObtenerVentasAsync_ShouldReturnVentas()
        {
            var context = GetContext();
            var sesion = new SesionCaja { Id = 1, MontoApertura = 500, FechaApertura = DateTime.Now };
            context.SesionCajas.Add(sesion);
            context.Venta.Add(new Ventum { Id = 1, Total = 100, Estado = "Completada", MetodoPago = "Efectivo", SesionCajaId = 1 });
            await context.SaveChangesAsync();

            var service = new VentasService(context);
            var ventas = await service.ObtenerVentasAsync();

            Assert.AreEqual(1, ventas.Count());
        }

        [TestMethod]
        public async Task ObtenerVentaPorIdAsync_ShouldReturnVenta()
        {
            var context = GetContext();
            var sesion = new SesionCaja { Id = 1, MontoApertura = 500, FechaApertura = DateTime.Now };
            context.SesionCajas.Add(sesion);
            context.Venta.Add(new Ventum { Id = 1, Total = 100, Estado = "Completada", MetodoPago = "Efectivo", SesionCajaId = 1 });
            await context.SaveChangesAsync();

            var service = new VentasService(context);
            var venta = await service.ObtenerVentaPorIdAsync(1);

            Assert.IsNotNull(venta);
            Assert.AreEqual(100, venta.Total);
        }

        [TestMethod]
        public async Task RegistrarVentaAsync_ValidStock_ShouldCompleteSale()
        {
            var context = GetContext();
            context.Productos.Add(new Producto { Id = 1, PrecioVenta = 10, StockActual = 5, Nombre = "Test" });
            await context.SaveChangesAsync();

            var service = new VentasService(context);
            var dto = new VentaCrearDTO 
            {
                ClienteId = null,
                MetodoPago = "Efectivo",
                SesionCajaId = 1,
                Detalles = new List<DetalleVentaCrearDTO> 
                { 
                    new DetalleVentaCrearDTO { ProductoId = 1, Cantidad = 2 }
                }
            };

            var venta = await service.RegistrarVentaAsync(dto);
            Assert.IsNotNull(venta);
            Assert.AreEqual(20, venta.Total);
            
            var p = await context.Productos.FindAsync(1);
            Assert.AreEqual(3, p.StockActual);
        }

        [TestMethod]
        public async Task RegistrarVentaAsync_InsufficientStock_ShouldThrowException()
        {
            var context = GetContext();
            context.Productos.Add(new Producto { Id = 1, PrecioVenta = 10, StockActual = 1, Nombre = "Test" });
            await context.SaveChangesAsync();

            var service = new VentasService(context);
            var dto = new VentaCrearDTO 
            {
                Detalles = new List<DetalleVentaCrearDTO> 
                { 
                    new DetalleVentaCrearDTO { ProductoId = 1, Cantidad = 2 }
                }
            };

            await Assert.ThrowsExceptionAsync<Exception>(() => service.RegistrarVentaAsync(dto));
        }
    }
}
