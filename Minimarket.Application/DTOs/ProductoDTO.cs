namespace Minimarket.Application.DTOs
{
    public class ProductoDTO
    {
        public int Id { get; set; }
        public string? CodigoBarras { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal PrecioCosto { get; set; }
        public decimal PrecioVenta { get; set; }
        public int StockActual { get; set; }
        public int StockMinimo { get; set; }
        public int CategoriaId { get; set; }
        public string? CategoriaNombre { get; set; }
        public DateTime? FechaVencimiento { get; set; }
    }
}
