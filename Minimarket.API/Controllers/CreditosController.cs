using Microsoft.AspNetCore.Mvc;
using Minimarket.Application.Interfaces;
using System.Threading.Tasks;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditosController : ControllerBase
    {
        private readonly ICreditoService _creditoService;

        public CreditosController(ICreditoService creditoService)
        {
            _creditoService = creditoService;
        }

        [HttpGet("clientes")]
        public async Task<IActionResult> ObtenerClientes()
        {
            var clientes = await _creditoService.ObtenerClientesAsync();
            return Ok(clientes);
        }

        [HttpGet("cliente/{clienteId}")]
        public async Task<IActionResult> ObtenerCreditosPorCliente(int clienteId)
        {
            var creditos = await _creditoService.ObtenerCreditosPorClienteAsync(clienteId);
            return Ok(creditos);
        }

        [HttpPost("abono")]
        public async Task<IActionResult> RegistrarAbono([FromBody] RegistrarAbonoRequest request)
        {
            try
            {
                var abono = await _creditoService.RegistrarAbonoAsync(request.CreditoId, request.Monto);
                return Ok(abono);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("clientes")]
        public async Task<IActionResult> RegistrarCliente([FromBody] RegistrarClienteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Nombre) || string.IsNullOrWhiteSpace(request.Documento))
            {
                return BadRequest("Nombre y Documento son requeridos.");
            }

            try
            {
                var cliente = await _creditoService.RegistrarClienteAsync(request.Nombre, request.Documento, request.LimiteCredito);
                return Ok(cliente);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class RegistrarClienteRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public string Documento { get; set; } = string.Empty;
        public decimal LimiteCredito { get; set; } = 100;
    }

    public class RegistrarAbonoRequest
    {
        public int CreditoId { get; set; }
        public decimal Monto { get; set; }
    }
}
