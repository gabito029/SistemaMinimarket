using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class SesionCaja
{
    public int Id { get; set; }

    public DateTime FechaApertura { get; set; }

    public decimal MontoApertura { get; set; }

    public decimal? MontoCierreReal { get; set; }

    public int? UsuarioId { get; set; }

    public virtual Usuario? Usuario { get; set; }

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
