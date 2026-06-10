using Minimarket.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Application.Interfaces
{
    public interface IVentasService
    {
        Task<IEnumerable<VentaDTO>> ObtenerVentasAsync();
        Task<VentaDTO?> ObtenerVentaPorIdAsync(int id);
        Task<VentaDTO> RegistrarVentaAsync(VentaCrearDTO ventaDto);
    }
}
