using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using Minimarket.Infrastructure.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Services
{
    [TestClass]
    public class CreditoServiceTests
    {
        private DbMinimarketContext GetContext()
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new DbMinimarketContext(options);
        }

        [TestMethod]
        public async Task ObtenerClientesAsync_ShouldReturnClientes()
        {
            var context = GetContext();
            context.Clientes.Add(new Cliente { Id = 1, Nombre = "Juan", Documento = "12345678" });
            await context.SaveChangesAsync();

            var service = new CreditoService(context);
            var clientes = await service.ObtenerClientesAsync();

            Assert.AreEqual(1, clientes.Count());
        }

        [TestMethod]
        public async Task ObtenerCreditosPorClienteAsync_ShouldReturnCreditos()
        {
            var context = GetContext();
            context.CreditoClientes.Add(new CreditoCliente { Id = 1, ClienteId = 1, SaldoPendiente = 50 });
            await context.SaveChangesAsync();

            var service = new CreditoService(context);
            var creditos = await service.ObtenerCreditosPorClienteAsync(1);

            Assert.AreEqual(1, creditos.Count());
            Assert.AreEqual(50, creditos.First().SaldoPendiente);
        }

        [TestMethod]
        public async Task RegistrarAbonoAsync_ShouldReduceSaldo()
        {
            var context = GetContext();
            context.CreditoClientes.Add(new CreditoCliente { Id = 1, ClienteId = 1, SaldoPendiente = 100 });
            await context.SaveChangesAsync();

            var service = new CreditoService(context);
            var abono = await service.RegistrarAbonoAsync(1, 40);

            Assert.IsNotNull(abono);
            Assert.AreEqual(40, abono.Monto);
            
            var c = await context.CreditoClientes.FindAsync(1);
            Assert.AreEqual(60, c.SaldoPendiente);
        }

        [TestMethod]
        public async Task RegistrarAbonoAsync_NonExistingCredito_ShouldThrow()
        {
            var context = GetContext();
            var service = new CreditoService(context);
            await Assert.ThrowsExceptionAsync<Exception>(() => service.RegistrarAbonoAsync(99, 40));
        }
    }
}
