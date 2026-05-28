using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using Minimarket.Infrastructure.Services;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Services
{
    [TestClass]
    public class InventarioServiceTests
    {
        private DbMinimarketContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;
            return new DbMinimarketContext(options);
        }

        [TestMethod]
        public async Task ObtenerProductosAsync_ShouldReturnAllProducts()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, Nombre = "Prod 1", CodigoBarras = "111", PrecioVenta = 10, StockActual = 5, CategoriaId = 1 });
            context.Productos.Add(new Producto { Id = 2, Nombre = "Prod 2", CodigoBarras = "222", PrecioVenta = 20, StockActual = 3, CategoriaId = 1 });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            var result = await service.ObtenerProductosAsync();

            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count());
        }

        [TestMethod]
        public async Task ObtenerProductoPorIdAsync_ExistingId_ShouldReturnProduct()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, Nombre = "Prod 1", PrecioVenta = 10, StockActual = 5 });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            var result = await service.ObtenerProductoPorIdAsync(1);

            Assert.IsNotNull(result);
            Assert.AreEqual("Prod 1", result.Nombre);
        }

        [TestMethod]
        public async Task ObtenerProductoPorIdAsync_NonExistingId_ShouldReturnNull()
        {
            var context = GetInMemoryContext();
            var service = new InventarioService(context);
            var result = await service.ObtenerProductoPorIdAsync(99);
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task ObtenerProductoPorCodigoAsync_ExistingCodigo_ShouldReturnProduct()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, CodigoBarras = "ABC", Nombre = "Prod 1" });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            var result = await service.ObtenerProductoPorCodigoAsync("ABC");

            Assert.IsNotNull(result);
            Assert.AreEqual("Prod 1", result.Nombre);
        }

        [TestMethod]
        public async Task ObtenerProductoPorCodigoAsync_NonExistingCodigo_ShouldReturnNull()
        {
            var context = GetInMemoryContext();
            var service = new InventarioService(context);
            var result = await service.ObtenerProductoPorCodigoAsync("XYZ");
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task CrearProductoAsync_ShouldAddProduct()
        {
            var context = GetInMemoryContext();
            var service = new InventarioService(context);
            
            var newProd = new Producto { CodigoBarras = "123", Nombre = "New Prod" };
            var result = await service.CrearProductoAsync(newProd);

            Assert.IsNotNull(result);
            Assert.AreNotEqual(0, result.Id);
            Assert.AreEqual(1, context.Productos.Count());
        }

        [TestMethod]
        public async Task ActualizarProductoAsync_ExistingId_ShouldUpdateAndReturnTrue()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, Nombre = "Old", PrecioVenta = 10 });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            var dto = new ProductoDTO { Nombre = "New", PrecioVenta = 15 };
            var success = await service.ActualizarProductoAsync(1, dto);

            Assert.IsTrue(success);
            var p = await context.Productos.FindAsync(1);
            Assert.AreEqual("New", p.Nombre);
            Assert.AreEqual(15, p.PrecioVenta);
        }

        [TestMethod]
        public async Task ActualizarProductoAsync_NonExistingId_ShouldReturnFalse()
        {
            var context = GetInMemoryContext();
            var service = new InventarioService(context);
            var success = await service.ActualizarProductoAsync(99, new ProductoDTO());
            Assert.IsFalse(success);
        }

        [TestMethod]
        public async Task EliminarProductoAsync_ExistingId_ShouldDeleteAndReturnTrue()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, Nombre = "Prod 1" });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            var success = await service.EliminarProductoAsync(1);

            Assert.IsTrue(success);
            Assert.AreEqual(0, context.Productos.Count());
        }

        [TestMethod]
        public async Task EliminarProductoAsync_NonExistingId_ShouldReturnFalse()
        {
            var context = GetInMemoryContext();
            var service = new InventarioService(context);
            var success = await service.EliminarProductoAsync(99);
            Assert.IsFalse(success);
        }

        [TestMethod]
        public async Task ActualizarStockAsync_Ingreso_ShouldIncreaseStock()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, StockActual = 10, Nombre = "Test" });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            await service.ActualizarStockAsync(1, 5, "Ingreso", "Compra");

            var p = await context.Productos.FindAsync(1);
            Assert.AreEqual(15, p.StockActual);
            Assert.AreEqual(1, context.AjusteStocks.Count());
        }

        [TestMethod]
        public async Task ActualizarStockAsync_Egreso_ShouldDecreaseStock()
        {
            var context = GetInMemoryContext();
            context.Productos.Add(new Producto { Id = 1, StockActual = 10, Nombre = "Test" });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            await service.ActualizarStockAsync(1, 3, "Egreso", "Venta");

            var p = await context.Productos.FindAsync(1);
            Assert.AreEqual(7, p.StockActual);
        }

        [TestMethod]
        public async Task ObtenerCategoriasAsync_ShouldReturnAll()
        {
            var context = GetInMemoryContext();
            context.Categoria.Add(new Categorium { Id = 1, Nombre = "Cat 1" });
            await context.SaveChangesAsync();

            var service = new InventarioService(context);
            var result = await service.ObtenerCategoriasAsync();

            Assert.AreEqual(1, result.Count());
        }

        [TestMethod]
        public async Task CrearCategoriaAsync_ShouldAdd()
        {
            var context = GetInMemoryContext();
            var service = new InventarioService(context);
            var result = await service.CrearCategoriaAsync(new Categorium { Nombre = "Cat 1" });

            Assert.IsNotNull(result);
            Assert.AreNotEqual(0, result.Id);
            Assert.AreEqual(1, context.Categoria.Count());
        }
    }
}
