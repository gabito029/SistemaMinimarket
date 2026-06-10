using FluentAssertions;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.Infrastructure.Services
{
    public class CreditoServiceTests
    {
        [Fact]
        public async Task ObtenerClientesAsync_DeberiaRetornarListaDeClientes()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            context.Clientes.Add(new Cliente { Nombre = "Cliente 1", Documento = "123" });
            context.Clientes.Add(new Cliente { Nombre = "Cliente 2", Documento = "456" });
            await context.SaveChangesAsync();
            
            var service = new CreditoService(context);

            // Act
            var clientes = await service.ObtenerClientesAsync();

            // Assert
            clientes.Should().HaveCount(2);
        }

        [Fact]
        public async Task ObtenerCreditosPorClienteAsync_DeberiaRetornarCreditosDelCliente()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var cliente = new Cliente { Id = 1, Nombre = "Cliente 1", Documento = "123" };
            context.Clientes.Add(cliente);
            context.CreditoClientes.Add(new CreditoCliente { ClienteId = 1, MontoTotal = 100, SaldoPendiente = 50 });
            context.CreditoClientes.Add(new CreditoCliente { ClienteId = 2, MontoTotal = 200, SaldoPendiente = 200 }); // Otro cliente
            await context.SaveChangesAsync();
            
            var service = new CreditoService(context);

            // Act
            var creditos = await service.ObtenerCreditosPorClienteAsync(1);

            // Assert
            creditos.Should().HaveCount(1);
            creditos.First().ClienteId.Should().Be(1);
        }

        [Fact]
        public async Task RegistrarAbonoAsync_DeberiaCrearAbonoYReducirSaldo()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var credito = new CreditoCliente { Id = 1, ClienteId = 1, MontoTotal = 100, SaldoPendiente = 100 };
            context.CreditoClientes.Add(credito);
            await context.SaveChangesAsync();
            
            var service = new CreditoService(context);

            // Act
            var abono = await service.RegistrarAbonoAsync(1, 30);

            // Assert
            abono.Should().NotBeNull();
            abono.Monto.Should().Be(30);
            
            var creditoActualizado = await context.CreditoClientes.FindAsync(1);
            creditoActualizado!.SaldoPendiente.Should().Be(70);
        }
    }
}
