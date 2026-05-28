using Microsoft.EntityFrameworkCore;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Infrastructure.Services
{
    public class CreditoService : ICreditoService
    {
        private readonly DbMinimarketContext _context;

        public CreditoService(DbMinimarketContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Cliente>> ObtenerClientesAsync()
        {
            return await _context.Clientes.ToListAsync();
        }

        public async Task<IEnumerable<CreditoCliente>> ObtenerCreditosPorClienteAsync(int clienteId)
        {
            return await _context.CreditoClientes.Where(c => c.ClienteId == clienteId).ToListAsync();
        }

        public async Task<AbonoCliente> RegistrarAbonoAsync(int creditoId, decimal monto)
        {
            var credito = await _context.CreditoClientes.FindAsync(creditoId);
            if (credito == null) throw new Exception("Crédito no encontrado");

            var abono = new AbonoCliente
            {
                CreditoClienteId = creditoId,
                Fecha = DateTime.Now,
                Monto = monto
            };

            credito.SaldoPendiente -= monto;

            _context.AbonoClientes.Add(abono);
            await _context.SaveChangesAsync();

            return abono;
        }
    }
}
