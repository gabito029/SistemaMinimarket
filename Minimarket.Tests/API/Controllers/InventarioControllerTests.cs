using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Minimarket.API.Controllers;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class InventarioControllerTests
    {
        [Fact]
        public async Task GetProductos_DeberiaRetornarOkConLista()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.ObtenerProductosAsync()).ReturnsAsync(new List<ProductoDTO> { new ProductoDTO() });
            var controller = new InventarioController(mockService.Object);

            var result = await controller.GetProductos();

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
            var items = okResult.Value as IEnumerable<ProductoDTO>;
            items.Should().NotBeEmpty();
        }

        [Fact]
        public async Task GetProductoPorId_CuandoExiste_DeberiaRetornarOk()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.ObtenerProductoPorIdAsync(1)).ReturnsAsync(new ProductoDTO { Id = 1 });
            var controller = new InventarioController(mockService.Object);

            var result = await controller.GetProductoPorId(1);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetProductoPorId_CuandoNoExiste_DeberiaRetornarNotFound()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.ObtenerProductoPorIdAsync(1)).ReturnsAsync((ProductoDTO?)null);
            var controller = new InventarioController(mockService.Object);

            var result = await controller.GetProductoPorId(1);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task CrearProducto_DeberiaRetornarCreatedAtAction()
        {
            var mockService = new Mock<IInventarioService>();
            var inputDto = new ProductoDTO { Nombre = "A" };
            var returnedEntity = new Producto { Id = 10, Nombre = "A" };
            
            mockService.Setup(s => s.CrearProductoAsync(It.IsAny<Producto>())).ReturnsAsync(returnedEntity);
            var controller = new InventarioController(mockService.Object);

            var result = await controller.CrearProducto(inputDto);

            var createdResult = result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
            createdResult.ActionName.Should().Be("GetProductoPorId");
        }

        [Fact]
        public async Task GetProductoPorCodigo_CuandoExiste_DeberiaRetornarOk()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.ObtenerProductoPorCodigoAsync("111")).ReturnsAsync(new ProductoDTO { Id = 1 });
            var controller = new InventarioController(mockService.Object);
            var result = await controller.GetProductoPorCodigo("111");
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }

        [Fact]
        public async Task ActualizarProducto_CuandoExitoso_DeberiaRetornarNoContent()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.ActualizarProductoAsync(1, It.IsAny<ProductoDTO>())).ReturnsAsync(true);
            var controller = new InventarioController(mockService.Object);
            var result = await controller.ActualizarProducto(1, new ProductoDTO());
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task EliminarProducto_CuandoExitoso_DeberiaRetornarNoContent()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.EliminarProductoAsync(1)).ReturnsAsync(true);
            var controller = new InventarioController(mockService.Object);
            var result = await controller.EliminarProducto(1);
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task AjustarStock_DeberiaRetornarNoContent()
        {
            var mockService = new Mock<IInventarioService>();
            var controller = new InventarioController(mockService.Object);
            var result = await controller.AjustarStock(1, new AjusteStockRequest { Cantidad = 5 });
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task GetCategorias_DeberiaRetornarOk()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.ObtenerCategoriasAsync()).ReturnsAsync(new List<Categorium>());
            var controller = new InventarioController(mockService.Object);
            var result = await controller.GetCategorias();
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task CrearCategoria_DeberiaRetornarCreatedAtAction()
        {
            var mockService = new Mock<IInventarioService>();
            mockService.Setup(s => s.CrearCategoriaAsync(It.IsAny<Categorium>())).ReturnsAsync(new Categorium { Id = 1 });
            var controller = new InventarioController(mockService.Object);
            var result = await controller.CrearCategoria(new Categorium());
            var created = result as CreatedAtActionResult;
            created.Should().NotBeNull();
        }
    }
}
