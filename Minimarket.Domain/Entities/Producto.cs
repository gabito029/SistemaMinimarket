using System;
using System.Collections.Generic;

namespace Minimarket.Domain.Entities;

public partial class Producto
{
    public int Id { get; set; }

    public string? CodigoBarras { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal PrecioCosto { get; set; }

    public decimal PrecioVenta { get; set; }

    public int StockActual { get; set; }

    // Valor por defecto para alertas de stock
    public int StockMinimo { get; set; } = 10;

    public DateTime? FechaVencimiento { get; set; }

    public int CategoriaId { get; set; }

    public virtual ICollection<AjusteStock> AjusteStocks { get; set; } = new List<AjusteStock>();

    public virtual Categorium Categoria { get; set; } = null!;

    public virtual ICollection<DetalleCompra> DetalleCompras { get; set; } = new List<DetalleCompra>();

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();
}
