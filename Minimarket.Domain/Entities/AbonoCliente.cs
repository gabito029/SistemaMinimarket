using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class AbonoCliente
{
    public int Id { get; set; }

    public int CreditoClienteId { get; set; }

    public DateTime Fecha { get; set; }

    public decimal Monto { get; set; }

    public virtual CreditoCliente CreditoCliente { get; set; } = null!;
}
