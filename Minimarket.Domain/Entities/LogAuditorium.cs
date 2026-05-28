using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class LogAuditorium
{
    public int Id { get; set; }

    public DateTime FechaHora { get; set; }

    public string Accion { get; set; } = null!;

    public string? Detalles { get; set; }
}
