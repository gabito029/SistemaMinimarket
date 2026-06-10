using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

using Minimarket.Domain.Entities;
namespace Minimarket.Infrastructure.Data;

public partial class DbMinimarketContext : DbContext
{
    //public DbMinimarketContext()
    

    public DbMinimarketContext(DbContextOptions<DbMinimarketContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AbonoCliente> AbonoClientes { get; set; }

    public virtual DbSet<AjusteStock> AjusteStocks { get; set; }

    public virtual DbSet<Categorium> Categoria { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Compra> Compras { get; set; }

    public virtual DbSet<ComprobantePago> ComprobantePagos { get; set; }

    public virtual DbSet<CreditoCliente> CreditoClientes { get; set; }

    public virtual DbSet<CuentaPorPagar> CuentaPorPagars { get; set; }

    public virtual DbSet<DetalleCompra> DetalleCompras { get; set; }

    public virtual DbSet<DetalleVentum> DetalleVenta { get; set; }

    public virtual DbSet<LogAuditorium> LogAuditoria { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Proveedor> Proveedors { get; set; }

    public virtual DbSet<SesionCaja> SesionCajas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }

    // Puedes dejar el método así de limpio, o eliminarlo por completo si no hay más código dentro.
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AbonoCliente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AbonoCli__3213E83FC4029477");

            entity.ToTable("AbonoCliente");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreditoClienteId).HasColumnName("credito_cliente_id");
            entity.Property(e => e.Fecha)
                .HasColumnType("datetime")
                .HasColumnName("fecha");
            entity.Property(e => e.Monto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("monto");

            entity.HasOne(d => d.CreditoCliente).WithMany(p => p.AbonoClientes)
                .HasForeignKey(d => d.CreditoClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AbonoClie__credi__68487DD7");
        });

        modelBuilder.Entity<AjusteStock>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AjusteSt__3213E83F8993FE69");

            entity.ToTable("AjusteStock");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.Fecha)
                .HasColumnType("datetime")
                .HasColumnName("fecha");
            entity.Property(e => e.Justificacion)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("justificacion");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Tipo)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("tipo");

            entity.HasOne(d => d.Producto).WithMany(p => p.AjusteStocks)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AjusteSto__produ__403A8C7D");
        });

        modelBuilder.Entity<Categorium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Categori__3213E83F7A8F8621");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cliente__3213E83F920D3C38");

            entity.ToTable("Cliente");

            entity.HasIndex(e => e.Documento, "UQ__Cliente__A25B3E61BF24EC48").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Documento)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("documento");
            entity.Property(e => e.LimiteCredito)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("limiteCredito");
            entity.Property(e => e.Nombre)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.SaldoDeudor)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("saldoDeudor");
        });

        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Compra__3213E83F39212B61");

            entity.ToTable("Compra");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Fecha)
                .HasColumnType("datetime")
                .HasColumnName("fecha");
            entity.Property(e => e.NroDocumento)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("nroDocumento");
            entity.Property(e => e.ProveedorId).HasColumnName("proveedor_id");
            entity.Property(e => e.Total)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total");

            entity.HasOne(d => d.Proveedor).WithMany(p => p.Compras)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Compra__proveedo__45F365D3");
        });

        modelBuilder.Entity<ComprobantePago>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Comproba__3213E83F2B2BDA80");

            entity.ToTable("ComprobantePago");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.NroComprobante)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("nroComprobante");
            entity.Property(e => e.Tipo)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("tipo");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");

            entity.HasOne(d => d.Venta).WithMany(p => p.ComprobantePagos)
                .HasForeignKey(d => d.VentaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Comproban__venta__5DCAEF64");
        });

        modelBuilder.Entity<CreditoCliente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CreditoC__3213E83FA3F99FC3");

            entity.ToTable("CreditoCliente");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.MontoTotal)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("montoTotal");
            entity.Property(e => e.SaldoPendiente)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("saldoPendiente");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");

            entity.HasOne(d => d.Cliente).WithMany(p => p.CreditoClientes)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CreditoCl__clien__6477ECF3");

            entity.HasOne(d => d.Venta).WithMany(p => p.CreditoClientes)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("FK__CreditoCl__venta__656C112C");
        });

        modelBuilder.Entity<CuentaPorPagar>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CuentaPo__3213E83F4097CDAD");

            entity.ToTable("CuentaPorPagar");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CompraId).HasColumnName("compra_id");
            entity.Property(e => e.MontoTotal)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("montoTotal");
            entity.Property(e => e.ProveedorId).HasColumnName("proveedor_id");
            entity.Property(e => e.SaldoPendiente)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("saldoPendiente");

            entity.HasOne(d => d.Compra).WithMany(p => p.CuentaPorPagars)
                .HasForeignKey(d => d.CompraId)
                .HasConstraintName("FK__CuentaPor__compr__4D94879B");

            entity.HasOne(d => d.Proveedor).WithMany(p => p.CuentaPorPagars)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CuentaPor__prove__4CA06362");
        });

        modelBuilder.Entity<DetalleCompra>(entity =>
        {
            entity.HasKey(e => new { e.CompraId, e.ProductoId }).HasName("PK__DetalleC__A421B7D2034ADC3B");

            entity.ToTable("DetalleCompra");

            entity.Property(e => e.CompraId).HasColumnName("compra_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.PrecioCosto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("precioCosto");

            entity.HasOne(d => d.Compra).WithMany(p => p.DetalleCompras)
                .HasForeignKey(d => d.CompraId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DetalleCo__compr__48CFD27E");

            entity.HasOne(d => d.Producto).WithMany(p => p.DetalleCompras)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DetalleCo__produ__49C3F6B7");
        });

        modelBuilder.Entity<DetalleVentum>(entity =>
        {
            entity.HasKey(e => new { e.VentaId, e.ProductoId }).HasName("PK__DetalleV__6E80C6E767D6279E");

            entity.Property(e => e.VentaId).HasColumnName("venta_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("precioUnitario");
            entity.Property(e => e.Subtotal)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("subtotal");

            entity.HasOne(d => d.Producto).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DetalleVe__produ__619B8048");

            entity.HasOne(d => d.Venta).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.VentaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DetalleVe__venta__60A75C0F");
        });

        modelBuilder.Entity<LogAuditorium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LogAudit__3213E83F1F666C82");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Accion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("accion");
            entity.Property(e => e.Detalles)
                .IsUnicode(false)
                .HasColumnName("detalles");
            entity.Property(e => e.FechaHora)
                .HasColumnType("datetime")
                .HasColumnName("fechaHora");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Producto__3213E83FA838611C");

            entity.ToTable("Producto");

            entity.HasIndex(e => e.CodigoBarras, "UQ__Producto__42674CE2073EB683").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CategoriaId).HasColumnName("categoria_id");
            entity.Property(e => e.CodigoBarras)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("codigoBarras");
            entity.Property(e => e.FechaVencimiento).HasColumnName("fechaVencimiento");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.PrecioCosto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("precioCosto");
            entity.Property(e => e.PrecioVenta)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("precioVenta");
            entity.Property(e => e.StockActual).HasColumnName("stockActual");
            entity.Property(e => e.StockMinimo).HasColumnName("stockMinimo");

            entity.HasOne(d => d.Categoria).WithMany(p => p.Productos)
                .HasForeignKey(d => d.CategoriaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Producto__catego__3C69FB99");
        });

        modelBuilder.Entity<Proveedor>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Proveedo__3213E83FB16BD446");

            entity.ToTable("Proveedor");

            entity.HasIndex(e => e.Ruc, "UQ__Proveedo__C2B74E6181C6BF11").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.RazonSocial)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("razonSocial");
            entity.Property(e => e.Ruc)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("ruc");
            entity.Property(e => e.Telefono)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("telefono");
            entity.Property(e => e.Direccion)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("direccion");
        });

        modelBuilder.Entity<SesionCaja>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SesionCa__3213E83F85716266");

            entity.ToTable("SesionCaja");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FechaApertura)
                .HasColumnType("datetime")
                .HasColumnName("fechaApertura");
            entity.Property(e => e.MontoApertura)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("montoApertura");
            entity.Property(e => e.MontoCierreReal)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("montoCierreReal");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.HasOne(d => d.Usuario).WithMany()
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("FK_SesionCaja_Usuario");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Usuario__3213E83FFE7054DA");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.Username, "UQ__Usuario__F3DBC57232691C4C").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Contrasena)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("contrasena");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Rol)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("rol");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Ventum>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Venta__3213E83F0B251E5E");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("estado");
            entity.Property(e => e.FechaHora)
                .HasColumnType("datetime")
                .HasColumnName("fechaHora");
            entity.Property(e => e.MetodoPago)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("metodoPago");
            entity.Property(e => e.SesionCajaId).HasColumnName("sesion_caja_id");
            entity.Property(e => e.Total)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Venta)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK__Venta__cliente_i__59FA5E80");

            entity.HasOne(d => d.SesionCaja).WithMany(p => p.Venta)
                .HasForeignKey(d => d.SesionCajaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Venta__sesion_ca__59063A47");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
