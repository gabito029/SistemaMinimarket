using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.API.Controllers;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Controllers
{
    [TestClass]
    public class CajaControllerTests
    {
        private Mock<ICajaService> _cajaServiceMock = null!;
        private CajaController _controller = null!;

        [TestInitialize]
        public void Setup()
        {
            _cajaServiceMock = new Mock<ICajaService>();
            _controller = new CajaController(_cajaServiceMock.Object);
        }

        [TestMethod]
        public async Task ObtenerCajaActiva_CajaExists_ReturnsOk()
        {
            var activeCaja = new SesionCajaDTO { Id = 1, MontoApertura = 100 };
            _cajaServiceMock.Setup(s => s.ObtenerCajaActivaAsync()).ReturnsAsync(activeCaja);

            var result = await _controller.ObtenerCajaActiva();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(activeCaja, okResult.Value);
        }

        [TestMethod]
        public async Task ObtenerCajaActiva_CajaNull_ReturnsNotFound()
        {
            _cajaServiceMock.Setup(s => s.ObtenerCajaActivaAsync()).ReturnsAsync((SesionCajaDTO?)null);

            var result = await _controller.ObtenerCajaActiva();

            var notFoundResult = result as NotFoundObjectResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task AbrirCaja_Success_ReturnsOk()
        {
            var request = new AbrirCajaRequest { MontoApertura = 100 };
            var sesion = new SesionCaja { Id = 1, MontoApertura = 100 };
            _cajaServiceMock.Setup(s => s.AbrirCajaAsync(100)).ReturnsAsync(sesion);

            var result = await _controller.AbrirCaja(request);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(sesion, okResult.Value);
        }

        [TestMethod]
        public async Task AbrirCaja_Exception_ReturnsBadRequest()
        {
            var request = new AbrirCajaRequest { MontoApertura = 100 };
            _cajaServiceMock.Setup(s => s.AbrirCajaAsync(100)).ThrowsAsync(new Exception("Error"));

            var result = await _controller.AbrirCaja(request);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("Error", badRequestResult.Value);
        }

        [TestMethod]
        public async Task CerrarCaja_Success_ReturnsOk()
        {
            var request = new CerrarCajaRequest { MontoCierreReal = 150 };
            var sesion = new SesionCaja { Id = 1, MontoCierreReal = 150 };
            _cajaServiceMock.Setup(s => s.CerrarCajaAsync(1, 150)).ReturnsAsync(sesion);

            var result = await _controller.CerrarCaja(1, request);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(sesion, okResult.Value);
        }

        [TestMethod]
        public async Task CerrarCaja_Exception_ReturnsBadRequest()
        {
            var request = new CerrarCajaRequest { MontoCierreReal = 150 };
            _cajaServiceMock.Setup(s => s.CerrarCajaAsync(1, 150)).ThrowsAsync(new Exception("Error"));

            var result = await _controller.CerrarCaja(1, request);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
        }
    }
}
