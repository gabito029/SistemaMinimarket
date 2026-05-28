using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class Cliente
{
    public int Id { get; set; }

    public string Documento { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public decimal? LimiteCredito { get; set; }

    public decimal? SaldoDeudor { get; set; }

    public virtual ICollection<CreditoCliente> CreditoClientes { get; set; } = new List<CreditoCliente>();

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
