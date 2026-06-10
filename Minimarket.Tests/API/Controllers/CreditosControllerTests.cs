using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Minimarket.API.Controllers;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class CreditosControllerTests
    {
        [Fact]
        public async Task ObtenerClientes_DeberiaRetornarOk()
        {
            var mockService = new Mock<ICreditoService>();
            mockService.Setup(s => s.ObtenerClientesAsync()).ReturnsAsync(new List<Cliente> { new Cliente() });
            var controller = new CreditosController(mockService.Object);

            var result = await controller.ObtenerClientes();

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }

        [Fact]
        public async Task ObtenerCreditosPorCliente_DeberiaRetornarOk()
        {
            var mockService = new Mock<ICreditoService>();
            mockService.Setup(s => s.ObtenerCreditosPorClienteAsync(1)).ReturnsAsync(new List<CreditoCliente> { new CreditoCliente() });
            var controller = new CreditosController(mockService.Object);

            var result = await controller.ObtenerCreditosPorCliente(1);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }
        
        [Fact]
        public async Task RegistrarAbono_CuandoExitoso_DeberiaRetornarOk()
        {
            var mockService = new Mock<ICreditoService>();
            mockService.Setup(s => s.RegistrarAbonoAsync(1, 100)).ReturnsAsync(new AbonoCliente());
            var controller = new CreditosController(mockService.Object);

            var result = await controller.RegistrarAbono(new RegistrarAbonoRequest { CreditoId = 1, Monto = 100 });

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }
    }
}
