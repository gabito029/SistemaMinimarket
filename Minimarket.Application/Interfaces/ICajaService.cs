using Minimarket.Application.DTOs;
using Minimarket.Domain.Entities;
using System.Threading.Tasks;

namespace Minimarket.Application.Interfaces
{
    public interface ICajaService
    {
        Task<SesionCaja> AbrirCajaAsync(decimal montoApertura);
        Task<SesionCaja> AbrirCajaConUsuarioAsync(decimal montoApertura, int usuarioId);
        Task<SesionCaja> CerrarCajaAsync(int id, decimal montoCierreReal);
        Task<SesionCajaDTO?> ObtenerCajaActivaAsync();
    }
}
