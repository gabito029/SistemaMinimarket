using Minimarket.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minimarket.Application.Interfaces
{
    public interface ICreditoService
    {
        Task<IEnumerable<Cliente>> ObtenerClientesAsync();
        Task<IEnumerable<CreditoCliente>> ObtenerCreditosPorClienteAsync(int clienteId);
        Task<AbonoCliente> RegistrarAbonoAsync(int creditoId, decimal monto);
    }
}
