using FluentAssertions;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.Infrastructure.Services
{
    public class CajaServiceTests
    {
        [Fact]
        public async Task AbrirCajaAsync_DeberiaCrearSesionConMontoApertura()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var service = new CajaService(context);
            var montoApertura = 500m;

            // Act
            var sesion = await service.AbrirCajaAsync(montoApertura);

            // Assert
            sesion.Should().NotBeNull();
            sesion.MontoApertura.Should().Be(montoApertura);
            sesion.Id.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task CerrarCajaAsync_DeberiaActualizarMontoCierre()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var service = new CajaService(context);
            var sesionApertura = await service.AbrirCajaAsync(500m);
            var montoCierre = 1500m;

            // Act
            var sesionCerrada = await service.CerrarCajaAsync(sesionApertura.Id, montoCierre);

            // Assert
            sesionCerrada.Should().NotBeNull();
            sesionCerrada.MontoCierreReal.Should().Be(montoCierre);
        }

        [Fact]
        public async Task ObtenerCajaActivaAsync_DeberiaRetornarLaUltimaCajaSinCerrar()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var service = new CajaService(context);
            await service.AbrirCajaAsync(500m);
            var ultimaSesion = await service.AbrirCajaAsync(1000m);

            // Act
            var cajaActiva = await service.ObtenerCajaActivaAsync();

            // Assert
            cajaActiva.Should().NotBeNull();
            cajaActiva!.MontoApertura.Should().Be(1000m);
            cajaActiva.Id.Should().Be(ultimaSesion.Id);
            cajaActiva.MontoCierreReal.Should().BeNull();
        }
    }
}
