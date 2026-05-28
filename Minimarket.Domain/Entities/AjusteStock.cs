using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class AjusteStock
{
    public int Id { get; set; }

    public int ProductoId { get; set; }

    public string Tipo { get; set; } = null!;

    public int Cantidad { get; set; }

    public string? Justificacion { get; set; }

    public DateTime Fecha { get; set; }

    public virtual Producto Producto { get; set; } = null!;
}
