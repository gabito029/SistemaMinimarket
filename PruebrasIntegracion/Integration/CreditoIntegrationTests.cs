using FluentAssertions;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using PruebrasIntegracion.Fixtures;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PruebrasIntegracion.Integration
{
    public class CreditoIntegrationTests : IClassFixture<SqlServerContainerFixture>
    {
        private readonly SqlServerContainerFixture _fixture;
        private readonly CreditoService _creditoService;

        public CreditoIntegrationTests(SqlServerContainerFixture fixture)
        {
            _fixture = fixture;
            _creditoService = new CreditoService(_fixture.DbContext);
        }

        [Fact]
        public async Task RegistrarCliente_DebeGuardarCorrectamente()
        {
            // Arrange
            string nombre = "Cliente Test Integracion";
            string documento = "99999999999";
            decimal limiteCredito = 500.00m;

            // Act
            var cliente = await _creditoService.RegistrarClienteAsync(nombre, documento, limiteCredito);

            // Assert
            cliente.Should().NotBeNull();
            cliente.Id.Should().BeGreaterThan(0);
            cliente.Nombre.Should().Be(nombre);
            cliente.Documento.Should().Be(documento);
            cliente.LimiteCredito.Should().Be(limiteCredito);
            cliente.SaldoDeudor.Should().Be(0);

            // Verificar persistencia
            var clientes = await _creditoService.ObtenerClientesAsync();
            clientes.Should().Contain(c => c.Documento == documento);
        }

        [Fact]
        public async Task RegistrarCliente_ConDocumentoDuplicado_DebeLanzarExcepcion()
        {
            // Arrange
            string nombre1 = "Cliente Uno";
            string nombre2 = "Cliente Dos";
            string documento = "88888888";
            decimal limite = 200m;

            await _creditoService.RegistrarClienteAsync(nombre1, documento, limite);

            // Act & Assert
            Func<Task> act = async () => await _creditoService.RegistrarClienteAsync(nombre2, documento, limite);
            await act.Should().ThrowAsync<Exception>()
                .WithMessage($"El cliente con DNI/RUC {documento} ya está registrado.");
        }

        [Fact]
        public async Task RegistrarAbono_DebeActualizarSaldoCorrectamente()
        {
            // Arrange
            var cliente = await _creditoService.RegistrarClienteAsync("Cliente Con Credito", "77777777", 1000m);
            
            var credito = new CreditoCliente
            {
                ClienteId = cliente.Id,
                MontoTotal = 500m,
                SaldoPendiente = 500m
            };
            _fixture.DbContext.CreditoClientes.Add(credito);
            await _fixture.DbContext.SaveChangesAsync();

            // Act
            var abono = await _creditoService.RegistrarAbonoAsync(credito.Id, 200m);

            // Assert
            abono.Should().NotBeNull();
            abono.Monto.Should().Be(200m);
            abono.CreditoClienteId.Should().Be(credito.Id);

            var creditoActualizado = (await _creditoService.ObtenerCreditosPorClienteAsync(cliente.Id))
                .FirstOrDefault(c => c.Id == credito.Id);
            
            creditoActualizado.Should().NotBeNull();
            creditoActualizado!.SaldoPendiente.Should().Be(300m); // 500m - 200m = 300m
        }

        [Fact]
        public async Task RegistrarAbono_ConCreditoNoExistente_DebeLanzarExcepcion()
        {
            // Act & Assert
            Func<Task> act = async () => await _creditoService.RegistrarAbonoAsync(9999, 100m);
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Crédito no encontrado");
        }
    }
}
