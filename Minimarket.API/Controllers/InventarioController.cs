using Microsoft.AspNetCore.Mvc;
using Minimarket.Application.Interfaces;
using Minimarket.Application.DTOs;
using System.Threading.Tasks;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventarioController : ControllerBase
    {
        private readonly IInventarioService _inventarioService;

        public InventarioController(IInventarioService inventarioService)
        {
            _inventarioService = inventarioService;
        }

        [HttpGet("productos")]
        public async Task<IActionResult> GetProductos()
        {
            return Ok(await _inventarioService.ObtenerProductosAsync());
        }

        [HttpGet("productos/{id}")]
        public async Task<IActionResult> GetProductoPorId(int id)
        {
            var prod = await _inventarioService.ObtenerProductoPorIdAsync(id);
            if (prod == null) return NotFound();
            return Ok(prod);
        }

        [HttpGet("productos/codigo/{codigo}")]
        public async Task<IActionResult> GetProductoPorCodigo(string codigo)
        {
            var prod = await _inventarioService.ObtenerProductoPorCodigoAsync(codigo);
            if (prod == null) return NotFound();
            return Ok(prod);
        }

        [HttpPost("productos")]
        public async Task<IActionResult> CrearProducto([FromBody] ProductoDTO dto)
        {
            var producto = new Minimarket.Domain.Entities.Producto
            {
                CodigoBarras = dto.CodigoBarras,
                Nombre = dto.Nombre,
                PrecioCosto = dto.PrecioCosto,
                PrecioVenta = dto.PrecioVenta,
                StockActual = dto.StockActual,
                StockMinimo = dto.StockMinimo,
                CategoriaId = dto.CategoriaId,
                FechaVencimiento = dto.FechaVencimiento
            };

            var nuevoProducto = await _inventarioService.CrearProductoAsync(producto);
            dto.Id = nuevoProducto.Id;
            return CreatedAtAction(nameof(GetProductoPorId), new { id = nuevoProducto.Id }, dto);
        }

        [HttpPut("productos/{id}")]
        public async Task<IActionResult> ActualizarProducto(int id, [FromBody] ProductoDTO dto)
        {
            var success = await _inventarioService.ActualizarProductoAsync(id, dto);
            if (!success) return NotFound("Producto no encontrado");
            return NoContent();
        }

        [HttpDelete("productos/{id}")]
        public async Task<IActionResult> EliminarProducto(int id)
        {
            var success = await _inventarioService.EliminarProductoAsync(id);
            if (!success) return NotFound("Producto no encontrado");
            return NoContent();
        }

        [HttpPost("productos/{id}/ajuste-stock")]
        public async Task<IActionResult> AjustarStock(int id, [FromBody] AjusteStockRequest request)
        {
            await _inventarioService.ActualizarStockAsync(id, request.Cantidad, request.TipoAjuste, request.Justificacion);
            return NoContent();
        }

        [HttpGet("categorias")]
        public async Task<IActionResult> GetCategorias()
        {
            return Ok(await _inventarioService.ObtenerCategoriasAsync());
        }

        [HttpPost("categorias")]
        public async Task<IActionResult> CrearCategoria([FromBody] Minimarket.Domain.Entities.Categorium categoria)
        {
            var nueva = await _inventarioService.CrearCategoriaAsync(categoria);
            return CreatedAtAction(nameof(GetCategorias), null, nueva);
        }
    }

    public class AjusteStockRequest
    {
        public int Cantidad { get; set; }
        public string TipoAjuste { get; set; } = "Ingreso";
        public string Justificacion { get; set; } = string.Empty;
    }
}
