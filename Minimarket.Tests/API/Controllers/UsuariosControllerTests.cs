using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Minimarket.API.Controllers;
using Minimarket.Domain.Entities;
using Minimarket.Tests;
using System.Threading.Tasks;
using Xunit;

namespace Minimarket.Tests.API.Controllers
{
    public class UsuariosControllerTests
    {
        [Fact]
        public async Task Login_CuandoCredencialesSonCorrectas_DeberiaRetornarOk()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            context.Usuarios.Add(new Usuario { Username = "admin", Contrasena = "123", Nombre = "Admin", Rol = "Admin" });
            await context.SaveChangesAsync();
            
            var controller = new UsuariosController(context);
            var req = new LoginRequest { Username = "admin", Contrasena = "123" };
            
            var result = await controller.Login(req);
            
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
        }

        [Fact]
        public async Task Login_CuandoCredencialesIncorrectas_DeberiaRetornarUnauthorized()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var controller = new UsuariosController(context);
            var req = new LoginRequest { Username = "admin", Contrasena = "wrong" };
            
            var result = await controller.Login(req);
            
            var unauthorized = result as UnauthorizedObjectResult;
            unauthorized.Should().NotBeNull();
        }

        [Fact]
        public async Task CrearUsuario_DeberiaRetornarCreatedAtAction()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var controller = new UsuariosController(context);
            
            var result = await controller.CrearUsuario(new Usuario { Username = "test", Nombre = "Test", Rol = "Cajero" });
            
            var created = result as CreatedAtActionResult;
            created.Should().NotBeNull();
            created!.StatusCode.Should().Be(201);
        }

        [Fact]
        public async Task ObtenerUsuarios_DeberiaRetornarOk()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var controller = new UsuariosController(context);
            var result = await controller.ObtenerUsuarios();
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task ActualizarUsuario_CuandoExiste_DeberiaRetornarNoContent()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            context.Usuarios.Add(new Usuario { Id = 1, Username = "test", Nombre = "N", Contrasena = "123", Rol = "Cajero" });
            await context.SaveChangesAsync();
            var controller = new UsuariosController(context);
            var result = await controller.ActualizarUsuario(1, new Usuario { Username = "new", Contrasena = "123" });
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task EliminarUsuario_CuandoExiste_DeberiaRetornarNoContent()
        {
            using var context = TestDbContextFactory.CreateInMemoryContext();
            context.Usuarios.Add(new Usuario { Id = 1, Username = "test", Nombre = "N", Contrasena = "123", Rol = "Cajero" });
            await context.SaveChangesAsync();
            var controller = new UsuariosController(context);
            var result = await controller.EliminarUsuario(1);
            result.Should().BeOfType<NoContentResult>();
        }
    }
}
