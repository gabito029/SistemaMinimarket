using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class Ventum
{
    public int Id { get; set; }

    public int SesionCajaId { get; set; }

    public int? ClienteId { get; set; }

    public DateTime FechaHora { get; set; }

    public decimal Total { get; set; }

    public string MetodoPago { get; set; } = null!;

    public string Estado { get; set; } = null!;

    public virtual Cliente? Cliente { get; set; }

    public virtual ICollection<ComprobantePago> ComprobantePagos { get; set; } = new List<ComprobantePago>();

    public virtual ICollection<CreditoCliente> CreditoClientes { get; set; } = new List<CreditoCliente>();

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual SesionCaja SesionCaja { get; set; } = null!;
}
