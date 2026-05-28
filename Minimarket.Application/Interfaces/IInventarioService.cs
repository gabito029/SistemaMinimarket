using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Application.Interfaces
{
    public interface IInventarioService
    {
        Task<IEnumerable<ProductoDTO>> ObtenerProductosAsync();
        Task<ProductoDTO?> ObtenerProductoPorIdAsync(int id);
        Task<ProductoDTO?> ObtenerProductoPorCodigoAsync(string codigo);
        Task<Producto> CrearProductoAsync(Producto producto);
        Task<bool> ActualizarProductoAsync(int id, ProductoDTO dto);
        Task<bool> EliminarProductoAsync(int id);
        Task ActualizarStockAsync(int productoId, int cantidad, string tipoAjuste, string justificacion);
        Task<IEnumerable<Categorium>> ObtenerCategoriasAsync();
        Task<Categorium> CrearCategoriaAsync(Categorium categoria);
    }
}
