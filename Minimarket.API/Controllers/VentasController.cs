using Microsoft.AspNetCore.Mvc;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using System.Threading.Tasks;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentasController : ControllerBase
    {
        private readonly IVentasService _ventasService;

        public VentasController(IVentasService ventasService)
        {
            _ventasService = ventasService;
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarVenta([FromBody] VentaCrearDTO dto)
        {
            try
            {
                var venta = await _ventasService.RegistrarVentaAsync(dto);
                return Ok(venta);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerVentas()
        {
            var ventas = await _ventasService.ObtenerVentasAsync();
            return Ok(ventas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerVentaPorId(int id)
        {
            var venta = await _ventasService.ObtenerVentaPorIdAsync(id);
            if (venta == null) return NotFound();
            return Ok(venta);
        }
    }
}
