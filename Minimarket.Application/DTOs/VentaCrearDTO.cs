using System.Collections.Generic;

namespace Minimarket.Application.DTOs
{
    public class VentaCrearDTO
    {
        public int SesionCajaId { get; set; }
        public int? ClienteId { get; set; }
        public string MetodoPago { get; set; } = string.Empty;
        public List<DetalleVentaCrearDTO> Detalles { get; set; } = new List<DetalleVentaCrearDTO>();
    }
}
