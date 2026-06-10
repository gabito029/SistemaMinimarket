using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Minimarket.API.Controllers;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class CajaControllerTests
    {
        [Fact]
        public async Task AbrirCaja_DeberiaRetornarOk()
        {
            var mockService = new Mock<ICajaService>();
            mockService.Setup(s => s.AbrirCajaAsync(500m)).ReturnsAsync(new SesionCaja { Id = 1, MontoApertura = 500m });
            var controller = new CajaController(mockService.Object);

            var req = new AbrirCajaRequest { MontoApertura = 500m };
            var result = await controller.AbrirCaja(req);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task ObtenerCajaActiva_CuandoExiste_DeberiaRetornarOk()
        {
            var mockService = new Mock<ICajaService>();
            mockService.Setup(s => s.ObtenerCajaActivaAsync()).ReturnsAsync(new SesionCajaDTO { Id = 1 });
            var controller = new CajaController(mockService.Object);

            var result = await controller.ObtenerCajaActiva();

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }

        [Fact]
        public async Task CerrarCaja_DeberiaRetornarOk()
        {
            var mockService = new Mock<ICajaService>();
            mockService.Setup(s => s.CerrarCajaAsync(1, 1500m)).ReturnsAsync(new SesionCaja { Id = 1 });
            var controller = new CajaController(mockService.Object);

            var req = new CerrarCajaRequest { MontoCierreReal = 1500m };
            var result = await controller.CerrarCaja(1, req);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }
    }
}
