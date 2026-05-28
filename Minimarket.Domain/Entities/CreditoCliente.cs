using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class CreditoCliente
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public int? VentaId { get; set; }

    public decimal MontoTotal { get; set; }

    public decimal SaldoPendiente { get; set; }

    public virtual ICollection<AbonoCliente> AbonoClientes { get; set; } = new List<AbonoCliente>();

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Ventum? Venta { get; set; }
}
