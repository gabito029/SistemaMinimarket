using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Application.Interfaces
{
    public interface IVentasService
    {
        Task<IEnumerable<Ventum>> ObtenerVentasAsync();
        Task<Ventum?> ObtenerVentaPorIdAsync(int id);
        Task<Ventum> RegistrarVentaAsync(VentaCrearDTO ventaDto);
    }
}
