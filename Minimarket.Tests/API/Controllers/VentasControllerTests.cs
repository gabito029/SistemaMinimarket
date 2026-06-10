using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Minimarket.API.Controllers;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class VentasControllerTests
    {
        [Fact]
        public async Task RegistrarVenta_CuandoEsExitoso_DeberiaRetornarOk()
        {
            var mockService = new Mock<IVentasService>();
            var dto = new VentaCrearDTO();
            mockService.Setup(s => s.RegistrarVentaAsync(dto)).ReturnsAsync(new VentaDTO { Id = 1 });
            var controller = new VentasController(mockService.Object);

            var result = await controller.RegistrarVenta(dto);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task RegistrarVenta_CuandoFalla_DeberiaRetornarBadRequest()
        {
            var mockService = new Mock<IVentasService>();
            var dto = new VentaCrearDTO();
            mockService.Setup(s => s.RegistrarVentaAsync(dto)).ThrowsAsync(new Exception("Error"));
            var controller = new VentasController(mockService.Object);

            var result = await controller.RegistrarVenta(dto);

            var badRequest = result as BadRequestObjectResult;
            badRequest.Should().NotBeNull();
            badRequest!.StatusCode.Should().Be(400);
            badRequest.Value.Should().Be("Error");
        }

        [Fact]
        public async Task ObtenerVentas_DeberiaRetornarLista()
        {
            var mockService = new Mock<IVentasService>();
            mockService.Setup(s => s.ObtenerVentasAsync()).ReturnsAsync(new List<VentaDTO> { new VentaDTO() });
            var controller = new VentasController(mockService.Object);

            var result = await controller.ObtenerVentas();

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task ObtenerVentaPorId_CuandoExiste_DeberiaRetornarOk()
        {
            var mockService = new Mock<IVentasService>();
            mockService.Setup(s => s.ObtenerVentaPorIdAsync(1)).ReturnsAsync(new VentaDTO { Id = 1 });
            var controller = new VentasController(mockService.Object);

            var result = await controller.ObtenerVentaPorId(1);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }
        
        [Fact]
        public async Task ObtenerVentaPorId_CuandoNoExiste_DeberiaRetornarNotFound()
        {
            var mockService = new Mock<IVentasService>();
            mockService.Setup(s => s.ObtenerVentaPorIdAsync(1)).ReturnsAsync((VentaDTO?)null);
            var controller = new VentasController(mockService.Object);

            var result = await controller.ObtenerVentaPorId(1);

            result.Should().BeOfType<NotFoundResult>();
        }
    }
}
