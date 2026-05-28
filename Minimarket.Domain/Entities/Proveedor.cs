using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class Proveedor
{
    public int Id { get; set; }

    public string Ruc { get; set; } = null!;

    public string RazonSocial { get; set; } = null!;

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();

    public virtual ICollection<CuentaPorPagar> CuentaPorPagars { get; set; } = new List<CuentaPorPagar>();
}
