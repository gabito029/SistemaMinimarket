using Xunit;
using Microsoft.EntityFrameworkCore;
using Minimarket.Infrastructure.Data;
using Minimarket.Infrastructure.Services;
using System.Threading.Tasks;
using System.Linq;

namespace Minimarket.Tests;

public class InventarioServiceTests
{
    private DbMinimarketContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<DbMinimarketContext>()
            .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
            .Options;
        return new DbMinimarketContext(options);
    }

    [Fact]
    public async Task ObtenerProductosAsync_ReturnsProducts()
    {
        using var context = CreateInMemoryContext();
        context.Productos.Add(new Minimarket.Domain.Entities.Producto { Id = 1, Nombre = "Prod1", PrecioVenta = 10, StockActual = 5, CategoriaId = 1 });
        context.Productos.Add(new Minimarket.Domain.Entities.Producto { Id = 2, Nombre = "Prod2", PrecioVenta = 20, StockActual = 3, CategoriaId = 1 });
        await context.SaveChangesAsync();

        var service = new InventarioService(context);
        var result = await service.ObtenerProductosAsync();

        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task ObtenerProductoPorIdAsync_NotFound_ReturnsNull()
    {
        using var context = CreateInMemoryContext();
        var service = new InventarioService(context);
        var res = await service.ObtenerProductoPorIdAsync(999);
        Assert.Null(res);
    }
}
