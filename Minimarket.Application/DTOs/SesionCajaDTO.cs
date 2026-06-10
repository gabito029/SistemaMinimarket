using System;

namespace Minimarket.Application.DTOs
{
    public class SesionCajaDTO
    {
        public int Id { get; set; }
        public DateTime FechaApertura { get; set; }
        public decimal MontoApertura { get; set; }
        public decimal? MontoCierreReal { get; set; }
        public int? UsuarioId { get; set; }
        public string? UsuarioNombre { get; set; }
    }
}
