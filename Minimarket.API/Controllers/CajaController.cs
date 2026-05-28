using Microsoft.AspNetCore.Mvc;
using Minimarket.Application.Interfaces;
using System.Threading.Tasks;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CajaController : ControllerBase
    {
        private readonly ICajaService _cajaService;

        public CajaController(ICajaService cajaService)
        {
            _cajaService = cajaService;
        }

        [HttpGet("activa")]
        public async Task<IActionResult> ObtenerCajaActiva()
        {
            var caja = await _cajaService.ObtenerCajaActivaAsync();
            if (caja == null) return NotFound("No hay caja activa");
            return Ok(caja);
        }

        [HttpPost("abrir")]
        public async Task<IActionResult> AbrirCaja([FromBody] AbrirCajaRequest request)
        {
            try
            {
                var sesion = await _cajaService.AbrirCajaAsync(request.MontoApertura);
                return Ok(sesion);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("cerrar/{id}")]
        public async Task<IActionResult> CerrarCaja(int id, [FromBody] CerrarCajaRequest request)
        {
            try
            {
                var sesion = await _cajaService.CerrarCajaAsync(id, request.MontoCierreReal);
                return Ok(sesion);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class AbrirCajaRequest
    {
        public decimal MontoApertura { get; set; }
    }

    public class CerrarCajaRequest
    {
        public decimal MontoCierreReal { get; set; }
    }
}
