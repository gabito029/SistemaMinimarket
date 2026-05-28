using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using Minimarket.Infrastructure.Services;
using Minimarket.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Services
{
    [TestClass]
    public class CajaServiceTests
    {
        private DbMinimarketContext GetContext()
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new DbMinimarketContext(options);
        }

        [TestMethod]
        public async Task AbrirCajaAsync_ShouldCreateSesion()
        {
            var context = GetContext();
            var service = new CajaService(context);
            var sesion = await service.AbrirCajaAsync(100);

            Assert.IsNotNull(sesion);
            Assert.AreEqual(100, sesion.MontoApertura);
            Assert.IsNull(sesion.MontoCierreReal);
        }

        [TestMethod]
        public async Task CerrarCajaAsync_ShouldUpdateMontoCierre()
        {
            var context = GetContext();
            var sesion = new SesionCaja { Id = 1, MontoApertura = 100, FechaApertura = DateTime.Now };
            context.SesionCajas.Add(sesion);
            await context.SaveChangesAsync();

            var service = new CajaService(context);
            var result = await service.CerrarCajaAsync(1, 150);

            Assert.IsNotNull(result);
            Assert.AreEqual(150, result.MontoCierreReal);
        }

        [TestMethod]
        public async Task ObtenerCajaActivaAsync_ShouldReturnActiveSesion()
        {
            var context = GetContext();
            context.SesionCajas.Add(new SesionCaja { Id = 1, MontoCierreReal = 200 }); // Closed
            context.SesionCajas.Add(new SesionCaja { Id = 2, MontoApertura = 50 }); // Active
            await context.SaveChangesAsync();

            var service = new CajaService(context);
            var dto = await service.ObtenerCajaActivaAsync();

            Assert.IsNotNull(dto);
            Assert.AreEqual(2, dto.Id);
            Assert.AreEqual(50, dto.MontoApertura);
        }

        [TestMethod]
        public async Task ObtenerCajaActivaAsync_NoActive_ShouldReturnNull()
        {
            var context = GetContext();
            context.SesionCajas.Add(new SesionCaja { Id = 1, MontoCierreReal = 200 }); // Closed
            await context.SaveChangesAsync();

            var service = new CajaService(context);
            var dto = await service.ObtenerCajaActivaAsync();

            Assert.IsNull(dto);
        }
    }
}
