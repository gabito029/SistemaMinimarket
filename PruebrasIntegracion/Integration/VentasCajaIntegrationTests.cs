using FluentAssertions;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Services;
using Minimarket.Application.DTOs;
using PruebrasIntegracion.Fixtures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PruebrasIntegracion.Integration
{
    public class VentasCajaIntegrationTests : IClassFixture<SqlServerContainerFixture>
    {
        private readonly SqlServerContainerFixture _fixture;
        private readonly VentasService _ventasService;
        private readonly CajaService _cajaService;
        private readonly InventarioService _inventarioService;

        public VentasCajaIntegrationTests(SqlServerContainerFixture fixture)
        {
            _fixture = fixture;
            _ventasService = new VentasService(_fixture.DbContext);
            _cajaService = new CajaService(_fixture.DbContext);
            _inventarioService = new InventarioService(_fixture.DbContext);
        }

        [Fact]
        public async Task FlujoCompleto_VentasYCaja_DebeFuncionarCorrectamente()
        {
            // 1. Crear Categoria y Producto
            var categoria = new Categorium { Nombre = "Bebidas" };
            var cat = await _inventarioService.CrearCategoriaAsync(categoria);

            var producto = new Producto
            {
                CodigoBarras = "7701234567890",
                Nombre = "Gaseosa Test 1.5L",
                PrecioCosto = 3.00m,
                PrecioVenta = 5.00m,
                StockActual = 50,
                StockMinimo = 5,
                CategoriaId = cat.Id
            };
            var prod = await _inventarioService.CrearProductoAsync(producto);

            // 2. Crear Usuario
            var usuario = new Usuario
            {
                Nombre = "Test Cajero",
                Username = "cajero_test",
                Contrasena = "cajero123",
                Rol = "Cajero"
            };
            _fixture.DbContext.Usuarios.Add(usuario);
            await _fixture.DbContext.SaveChangesAsync();

            // 3. Abrir Caja
            var sesionCaja = await _cajaService.AbrirCajaConUsuarioAsync(200.00m, usuario.Id);
            sesionCaja.Should().NotBeNull();
            sesionCaja.MontoApertura.Should().Be(200.00m);
            sesionCaja.MontoCierreReal.Should().BeNull();

            // 4. Registrar Venta
            var ventaDto = new VentaCrearDTO
            {
                SesionCajaId = sesionCaja.Id,
                ClienteId = null,
                MetodoPago = "Efectivo",
                Detalles = new List<DetalleVentaCrearDTO>
                {
                    new DetalleVentaCrearDTO { ProductoId = prod.Id, Cantidad = 5 }
                }
            };

            var ventaRegistrada = await _ventasService.RegistrarVentaAsync(ventaDto);
            ventaRegistrada.Should().NotBeNull();
            ventaRegistrada.Total.Should().Be(25.00m); // 5 unidades * 5.00m = 25.00m

            // Verificar descuento de stock
            var prodActualizado = await _inventarioService.ObtenerProductoPorIdAsync(prod.Id);
            prodActualizado!.StockActual.Should().Be(45); // 50 - 5 = 45

            // 5. Cerrar Caja
            var cajaCerrada = await _cajaService.CerrarCajaAsync(sesionCaja.Id, 225.00m);
            cajaCerrada.Should().NotBeNull();
            cajaCerrada.MontoCierreReal.Should().Be(225.00m);
        }
    }
}
