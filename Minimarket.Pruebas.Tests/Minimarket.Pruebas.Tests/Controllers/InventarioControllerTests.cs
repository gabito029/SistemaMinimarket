using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.API.Controllers;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Controllers
{
    [TestClass]
    public class InventarioControllerTests
    {
        private Mock<IInventarioService> _inventarioServiceMock = null!;
        private InventarioController _controller = null!;

        [TestInitialize]
        public void Setup()
        {
            _inventarioServiceMock = new Mock<IInventarioService>();
            _controller = new InventarioController(_inventarioServiceMock.Object);
        }

        [TestMethod]
        public async Task GetProductos_ReturnsOk()
        {
            var list = new List<ProductoDTO> { new ProductoDTO { Id = 1, Nombre = "Prod" } };
            _inventarioServiceMock.Setup(s => s.ObtenerProductosAsync()).ReturnsAsync(list);

            var result = await _controller.GetProductos();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(list, okResult.Value);
        }

        [TestMethod]
        public async Task GetProductoPorId_Existing_ReturnsOk()
        {
            var prod = new ProductoDTO { Id = 1, Nombre = "Prod" };
            _inventarioServiceMock.Setup(s => s.ObtenerProductoPorIdAsync(1)).ReturnsAsync(prod);

            var result = await _controller.GetProductoPorId(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(prod, okResult.Value);
        }

        [TestMethod]
        public async Task GetProductoPorId_NonExisting_ReturnsNotFound()
        {
            _inventarioServiceMock.Setup(s => s.ObtenerProductoPorIdAsync(99)).ReturnsAsync((ProductoDTO?)null);

            var result = await _controller.GetProductoPorId(99);

            var notFoundResult = result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task GetProductoPorCodigo_Existing_ReturnsOk()
        {
            var prod = new ProductoDTO { Id = 1, Nombre = "Prod" };
            _inventarioServiceMock.Setup(s => s.ObtenerProductoPorCodigoAsync("123")).ReturnsAsync(prod);

            var result = await _controller.GetProductoPorCodigo("123");

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task GetProductoPorCodigo_NonExisting_ReturnsNotFound()
        {
            _inventarioServiceMock.Setup(s => s.ObtenerProductoPorCodigoAsync("XYZ")).ReturnsAsync((ProductoDTO?)null);

            var result = await _controller.GetProductoPorCodigo("XYZ");

            var notFoundResult = result as NotFoundResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task CrearProducto_ReturnsCreatedAtAction()
        {
            var dto = new ProductoDTO { Nombre = "Prod" };
            var returnedEntity = new Producto { Id = 123, Nombre = "Prod" };
            _inventarioServiceMock.Setup(s => s.CrearProductoAsync(It.IsAny<Producto>())).ReturnsAsync(returnedEntity);

            var result = await _controller.CrearProducto(dto);

            var createdResult = result as CreatedAtActionResult;
            Assert.IsNotNull(createdResult);
            Assert.AreEqual("GetProductoPorId", createdResult.ActionName);
            Assert.AreEqual(123, dto.Id);
        }

        [TestMethod]
        public async Task ActualizarProducto_Existing_ReturnsNoContent()
        {
            var dto = new ProductoDTO { Nombre = "New" };
            _inventarioServiceMock.Setup(s => s.ActualizarProductoAsync(1, dto)).ReturnsAsync(true);

            var result = await _controller.ActualizarProducto(1, dto);

            var noContentResult = result as NoContentResult;
            Assert.IsNotNull(noContentResult);
        }

        [TestMethod]
        public async Task ActualizarProducto_NonExisting_ReturnsNotFound()
        {
            var dto = new ProductoDTO();
            _inventarioServiceMock.Setup(s => s.ActualizarProductoAsync(99, dto)).ReturnsAsync(false);

            var result = await _controller.ActualizarProducto(99, dto);

            var notFoundResult = result as NotFoundObjectResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task EliminarProducto_Existing_ReturnsNoContent()
        {
            _inventarioServiceMock.Setup(s => s.EliminarProductoAsync(1)).ReturnsAsync(true);

            var result = await _controller.EliminarProducto(1);

            var noContentResult = result as NoContentResult;
            Assert.IsNotNull(noContentResult);
        }

        [TestMethod]
        public async Task EliminarProducto_NonExisting_ReturnsNotFound()
        {
            _inventarioServiceMock.Setup(s => s.EliminarProductoAsync(99)).ReturnsAsync(false);

            var result = await _controller.EliminarProducto(99);

            var notFoundResult = result as NotFoundObjectResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task AjustarStock_ReturnsNoContent()
        {
            var request = new AjusteStockRequest { Cantidad = 5, TipoAjuste = "Ingreso", Justificacion = "Test" };
            _inventarioServiceMock.Setup(s => s.ActualizarStockAsync(1, 5, "Ingreso", "Test")).Returns(Task.CompletedTask);

            var result = await _controller.AjustarStock(1, request);

            var noContentResult = result as NoContentResult;
            Assert.IsNotNull(noContentResult);
        }

        [TestMethod]
        public async Task GetCategorias_ReturnsOk()
        {
            var list = new List<Categorium> { new Categorium { Id = 1, Nombre = "Cat" } };
            _inventarioServiceMock.Setup(s => s.ObtenerCategoriasAsync()).ReturnsAsync(list);

            var result = await _controller.GetCategorias();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task CrearCategoria_ReturnsCreatedAtAction()
        {
            var cat = new Categorium { Nombre = "Cat" };
            _inventarioServiceMock.Setup(s => s.CrearCategoriaAsync(cat)).ReturnsAsync(cat);

            var result = await _controller.CrearCategoria(cat);

            var createdResult = result as CreatedAtActionResult;
            Assert.IsNotNull(createdResult);
        }
    }
}
