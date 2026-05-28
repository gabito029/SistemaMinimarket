using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class ComprobantePago
{
    public int Id { get; set; }

    public int VentaId { get; set; }

    public string NroComprobante { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public virtual Ventum Venta { get; set; } = null!;
}
