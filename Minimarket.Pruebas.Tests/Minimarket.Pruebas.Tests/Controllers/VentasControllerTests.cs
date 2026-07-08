using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.API.Controllers;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Controllers
{
    [TestClass]
    public class VentasControllerTests
    {
        private Mock<IVentasService> _ventasServiceMock = null!;
        private VentasController _controller = null!;

        [TestInitialize]
        public void Setup()
        {
            _ventasServiceMock = new Mock<IVentasService>();
            _controller = new VentasController(_ventasServiceMock.Object);
        }

        [TestMethod]
        public async Task RegistrarVenta_Success_ReturnsOk()
        {
            var dto = new VentaCrearDTO();
            var returnedVenta = new VentaDTO { Id = 1, Total = 50 };
            _ventasServiceMock.Setup(s => s.RegistrarVentaAsync(dto)).ReturnsAsync(returnedVenta);

            var result = await _controller.RegistrarVenta(dto);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(returnedVenta, okResult.Value);
        }

        [TestMethod]
        public async Task RegistrarVenta_Exception_ReturnsBadRequest()
        {
            var dto = new VentaCrearDTO();
            _ventasServiceMock.Setup(s => s.RegistrarVentaAsync(dto)).ThrowsAsync(new Exception("Error"));

            var result = await _controller.RegistrarVenta(dto);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("Error", badRequestResult.Value);
        }

        [TestMethod]
        public async Task ObtenerVentas_ReturnsOk()
        {
            var list = new List<VentaDTO> { new VentaDTO { Id = 1 } };
            _ventasServiceMock.Setup(s => s.ObtenerVentasAsync()).ReturnsAsync(list);

            var result = await _controller.ObtenerVentas();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task ObtenerVentaPorId_Existing_ReturnsOk()
        {
            var venta = new VentaDTO { Id = 1 };
            _ventasServiceMock.Setup(s => s.ObtenerVentaPorIdAsync(1)).ReturnsAsync(venta);

            var result = await _controller.ObtenerVentaPorId(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task ObtenerVentaPorId_NonExisting_ReturnsNotFound()
        {
            _ventasServiceMock.Setup(s => s.ObtenerVentaPorIdAsync(99)).ReturnsAsync((VentaDTO?)null);

            var result = await _controller.ObtenerVentaPorId(99);

            var notFoundResult = result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }
    }
}
