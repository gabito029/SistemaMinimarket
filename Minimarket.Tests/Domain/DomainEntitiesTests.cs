using FluentAssertions;
using Minimarket.Domain.Entities;
using System;
using System.Collections.Generic;
using Xunit;

namespace Minimarket.Tests.Domain
{
    public class DomainEntitiesTests
    {
        [Fact]
        public void Compra_GettersSetters_DeberianFuncionar()
        {
            var entity = new Compra();
            entity.Id = 1;
            entity.Fecha = DateTime.Now;
            entity.NroDocumento = "DOC";
            entity.Total = 100;
            entity.ProveedorId = 1;
            entity.Proveedor = new Proveedor { Id = 1 };
            entity.DetalleCompras = new List<DetalleCompra>();
            entity.CuentaPorPagars = new List<CuentaPorPagar>();

            entity.Id.Should().Be(1);
            entity.NroDocumento.Should().Be("DOC");
            entity.Total.Should().Be(100);
            entity.Proveedor.Should().NotBeNull();
            entity.DetalleCompras.Should().NotBeNull();
            entity.CuentaPorPagars.Should().NotBeNull();
        }

        [Fact]
        public void ComprobantePago_GettersSetters_DeberianFuncionar()
        {
            var entity = new ComprobantePago();
            entity.Id = 1;
            entity.NroComprobante = "C1";
            entity.Tipo = "Boleta";
            entity.VentaId = 1;
            entity.Venta = new Ventum();

            entity.Id.Should().Be(1);
            entity.NroComprobante.Should().Be("C1");
            entity.Venta.Should().NotBeNull();
        }

        [Fact]
        public void CuentaPorPagar_GettersSetters_DeberianFuncionar()
        {
            var entity = new CuentaPorPagar();
            entity.Id = 1;
            entity.ProveedorId = 1;
            entity.CompraId = 1;
            entity.MontoTotal = 100;
            entity.SaldoPendiente = 50;
            entity.Compra = new Compra();
            entity.Proveedor = new Proveedor();

            entity.SaldoPendiente.Should().Be(50);
            entity.Compra.Should().NotBeNull();
            entity.Proveedor.Should().NotBeNull();
        }

        [Fact]
        public void DetalleCompra_GettersSetters_DeberianFuncionar()
        {
            var entity = new DetalleCompra();
            entity.CompraId = 1;
            entity.ProductoId = 1;
            entity.Cantidad = 2;
            entity.PrecioCosto = 10;
            entity.Compra = new Compra();
            entity.Producto = new Producto();

            entity.Cantidad.Should().Be(2);
            entity.Compra.Should().NotBeNull();
            entity.Producto.Should().NotBeNull();
        }

        [Fact]
        public void Proveedor_GettersSetters_DeberianFuncionar()
        {
            var entity = new Proveedor();
            entity.Id = 1;
            entity.RazonSocial = "RS";
            entity.Ruc = "123";
            entity.Compras = new List<Compra>();
            entity.CuentaPorPagars = new List<CuentaPorPagar>();

            entity.RazonSocial.Should().Be("RS");
            entity.Compras.Should().NotBeNull();
            entity.CuentaPorPagars.Should().NotBeNull();
        }

        [Fact]
        public void LogAuditoria_GettersSetters_DeberianFuncionar()
        {
            var entity = new LogAuditorium();
            entity.Id = 1;
            entity.Accion = "Accion";
            entity.Detalles = "Detalles";
            entity.FechaHora = DateTime.Now;

            entity.Accion.Should().Be("Accion");
            entity.Detalles.Should().Be("Detalles");
        }
        
        [Fact]
        public void Cliente_GettersSetters_DeberianFuncionar()
        {
            var entity = new Cliente();
            entity.Id = 1;
            entity.Nombre = "Nom";
            entity.Documento = "Doc";
            entity.LimiteCredito = 10;
            entity.SaldoDeudor = 5;
            entity.CreditoClientes = new List<CreditoCliente>();
            entity.Venta = new List<Ventum>();
            
            entity.Nombre.Should().Be("Nom");
            entity.CreditoClientes.Should().NotBeNull();
            entity.Venta.Should().NotBeNull();
        }
        
        [Fact]
        public void Producto_GettersSetters_DeberianFuncionar()
        {
            var entity = new Producto();
            entity.Id = 1;
            entity.CategoriaId = 1;
            entity.CodigoBarras = "1";
            entity.Nombre = "1";
            entity.PrecioCosto = 1;
            entity.PrecioVenta = 1;
            entity.StockActual = 1;
            entity.StockMinimo = 1;
            entity.FechaVencimiento = DateTime.MinValue;

            entity.AjusteStocks = new List<AjusteStock>();
            entity.Categoria = new Categorium();
            entity.DetalleCompras = new List<DetalleCompra>();
            entity.DetalleVenta = new List<DetalleVentum>();
            
            entity.Nombre.Should().Be("1");
        }
        
        [Fact]
        public void Categorium_GettersSetters_DeberianFuncionar()
        {
            var entity = new Categorium();
            entity.Id = 1;
            entity.Nombre = "1";
            entity.Productos = new List<Producto>();
            entity.Productos.Should().NotBeNull();
        }
    }
}
