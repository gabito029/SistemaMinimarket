using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class DetalleCompra
{
    public int CompraId { get; set; }

    public int ProductoId { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioCosto { get; set; }

    public virtual Compra Compra { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;
}
