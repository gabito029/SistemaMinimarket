using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.API.Controllers;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Controllers
{
    [TestClass]
    public class CreditosControllerTests
    {
        private Mock<ICreditoService> _creditoServiceMock = null!;
        private CreditosController _controller = null!;

        [TestInitialize]
        public void Setup()
        {
            _creditoServiceMock = new Mock<ICreditoService>();
            _controller = new CreditosController(_creditoServiceMock.Object);
        }

        [TestMethod]
        public async Task ObtenerClientes_ReturnsOk()
        {
            var clientes = new List<Cliente> { new Cliente { Id = 1, Nombre = "Juan" } };
            _creditoServiceMock.Setup(s => s.ObtenerClientesAsync()).ReturnsAsync(clientes);

            var result = await _controller.ObtenerClientes();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(clientes, okResult.Value);
        }

        [TestMethod]
        public async Task ObtenerCreditosPorCliente_ReturnsOk()
        {
            var creditos = new List<CreditoCliente> { new CreditoCliente { Id = 1, ClienteId = 1 } };
            _creditoServiceMock.Setup(s => s.ObtenerCreditosPorClienteAsync(1)).ReturnsAsync(creditos);

            var result = await _controller.ObtenerCreditosPorCliente(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(creditos, okResult.Value);
        }

        [TestMethod]
        public async Task RegistrarAbono_Success_ReturnsOk()
        {
            var request = new RegistrarAbonoRequest { CreditoId = 1, Monto = 50 };
            var abono = new AbonoCliente { Id = 1, CreditoClienteId = 1, Monto = 50 };
            _creditoServiceMock.Setup(s => s.RegistrarAbonoAsync(1, 50)).ReturnsAsync(abono);

            var result = await _controller.RegistrarAbono(request);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(abono, okResult.Value);
        }

        [TestMethod]
        public async Task RegistrarAbono_Exception_ReturnsBadRequest()
        {
            var request = new RegistrarAbonoRequest { CreditoId = 1, Monto = 50 };
            _creditoServiceMock.Setup(s => s.RegistrarAbonoAsync(1, 50)).ThrowsAsync(new Exception("Error"));

            var result = await _controller.RegistrarAbono(request);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
        }
    }
}
