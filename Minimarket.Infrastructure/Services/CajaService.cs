using Microsoft.EntityFrameworkCore;
using Minimarket.Application.DTOs;
using Minimarket.Application.Interfaces;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Infrastructure.Services
{
    public class CajaService : ICajaService
    {
        private readonly DbMinimarketContext _context;

        public CajaService(DbMinimarketContext context)
        {
            _context = context;
        }

        public async Task<SesionCaja> AbrirCajaAsync(decimal montoApertura)
        {
            var sesion = new SesionCaja
            {
                FechaApertura = DateTime.Now,
                MontoApertura = montoApertura
            };
            _context.SesionCajas.Add(sesion);
            await _context.SaveChangesAsync();
            return sesion;
        }

        public async Task<SesionCaja> CerrarCajaAsync(int id, decimal montoCierreReal)
        {
            var sesion = await _context.SesionCajas.FindAsync(id);
            if (sesion != null)
            {
                sesion.MontoCierreReal = montoCierreReal;
                await _context.SaveChangesAsync();
            }
            return sesion!;
        }

        public async Task<SesionCajaDTO?> ObtenerCajaActivaAsync()
        {
            var sesion = await _context.SesionCajas
                .Where(s => s.MontoCierreReal == null)
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync();

            if (sesion == null) return null;

            return new SesionCajaDTO
            {
                Id = sesion.Id,
                FechaApertura = sesion.FechaApertura,
                MontoApertura = sesion.MontoApertura,
                MontoCierreReal = sesion.MontoCierreReal
            };
        }
    }
}
