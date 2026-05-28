using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class CuentaPorPagar
{
    public int Id { get; set; }

    public int ProveedorId { get; set; }

    public int? CompraId { get; set; }

    public decimal MontoTotal { get; set; }

    public decimal SaldoPendiente { get; set; }

    public virtual Compra? Compra { get; set; }

    public virtual Proveedor Proveedor { get; set; } = null!;
}
