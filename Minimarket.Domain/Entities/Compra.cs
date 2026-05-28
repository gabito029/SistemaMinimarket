using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class Compra
{
    public int Id { get; set; }

    public int ProveedorId { get; set; }

    public string? NroDocumento { get; set; }

    public DateTime Fecha { get; set; }

    public decimal Total { get; set; }

    public virtual ICollection<CuentaPorPagar> CuentaPorPagars { get; set; } = new List<CuentaPorPagar>();

    public virtual ICollection<DetalleCompra> DetalleCompras { get; set; } = new List<DetalleCompra>();

    public virtual Proveedor Proveedor { get; set; } = null!;
}
