using System;
using System.Collections.Generic;

namespace Minimarket.Application.DTOs
{
    public class VentaDTO
    {
        public int Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string MetodoPago { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public decimal Total { get; set; }
        public int SesionCajaId { get; set; }

        public VentaClienteDTO? Cliente { get; set; }
        public VentaSesionCajaDTO? SesionCaja { get; set; }
        public List<VentaDetalleDTO> DetalleVenta { get; set; } = new();
    }

    public class VentaClienteDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Documento { get; set; }
    }

    public class VentaSesionCajaDTO
    {
        public int Id { get; set; }
        public VentaUsuarioDTO? Usuario { get; set; }
    }

    public class VentaUsuarioDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Username { get; set; } = null!;
    }

    public class VentaDetalleDTO
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
        public VentaProductoDTO? Producto { get; set; }
    }

    public class VentaProductoDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public decimal PrecioVenta { get; set; }
    }
}
