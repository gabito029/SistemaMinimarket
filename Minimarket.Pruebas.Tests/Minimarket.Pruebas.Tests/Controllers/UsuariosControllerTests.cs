using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minimarket.API.Controllers;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.Pruebas.Tests.Controllers
{
    [TestClass]
    public class UsuariosControllerTests
    {
        private DbMinimarketContext GetContext()
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new DbMinimarketContext(options);
        }

        [TestMethod]
        public async Task ObtenerUsuarios_ReturnsOk()
        {
            var context = GetContext();
            context.Usuarios.Add(new Usuario { Id = 1, Nombre = "User", Username = "user1", Contrasena = "123", Rol = "Admin" });
            await context.SaveChangesAsync();

            var controller = new UsuariosController(context);
            var result = await controller.ObtenerUsuarios();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            
            var list = okResult.Value as IEnumerable<object>;
            Assert.IsNotNull(list);
            Assert.AreEqual(1, list.Count());
        }

        [TestMethod]
        public async Task CrearUsuario_Success_ReturnsCreatedAtAction()
        {
            var context = GetContext();
            var controller = new UsuariosController(context);
            var u = new Usuario { Nombre = "User", Username = "user1", Rol = "Admin", Contrasena = "" }; // empty string

            var result = await controller.CrearUsuario(u);

            var createdResult = result as CreatedAtActionResult;
            Assert.IsNotNull(createdResult);
            Assert.AreEqual("123456", u.Contrasena);
            Assert.AreEqual(1, context.Usuarios.Count());
        }

        [TestMethod]
        public async Task ActualizarUsuario_Existing_ReturnsNoContent()
        {
            var context = GetContext();
            context.Usuarios.Add(new Usuario { Id = 1, Nombre = "Old", Username = "old", Rol = "Cashier", Contrasena = "123" });
            await context.SaveChangesAsync();

            var controller = new UsuariosController(context);
            var updated = new Usuario { Nombre = "New", Username = "new", Rol = "Admin", Contrasena = "999" };
            var result = await controller.ActualizarUsuario(1, updated);

            var noContentResult = result as NoContentResult;
            Assert.IsNotNull(noContentResult);

            var dbUser = await context.Usuarios.FindAsync(1);
            Assert.AreEqual("New", dbUser!.Nombre);
            Assert.AreEqual("999", dbUser.Contrasena);
        }

        [TestMethod]
        public async Task ActualizarUsuario_NonExisting_ReturnsNotFound()
        {
            var context = GetContext();
            var controller = new UsuariosController(context);
            var result = await controller.ActualizarUsuario(99, new Usuario());
            var notFoundResult = result as NotFoundObjectResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task EliminarUsuario_Existing_ReturnsNoContent()
        {
            var context = GetContext();
            context.Usuarios.Add(new Usuario { Id = 1, Nombre = "User", Username = "user1", Rol = "Admin", Contrasena = "123" });
            await context.SaveChangesAsync();

            var controller = new UsuariosController(context);
            var result = await controller.EliminarUsuario(1);

            var noContentResult = result as NoContentResult;
            Assert.IsNotNull(noContentResult);
            Assert.AreEqual(0, context.Usuarios.Count());
        }

        [TestMethod]
        public async Task EliminarUsuario_NonExisting_ReturnsNotFound()
        {
            var context = GetContext();
            var controller = new UsuariosController(context);
            var result = await controller.EliminarUsuario(99);
            var notFoundResult = result as NotFoundObjectResult;
            Assert.IsNotNull(notFoundResult);
        }

        [TestMethod]
        public async Task Login_Success_ReturnsOk()
        {
            var context = GetContext();
            context.Usuarios.Add(new Usuario { Id = 1, Username = "admin", Contrasena = "admin", Nombre = "Admin", Rol = "Admin" });
            await context.SaveChangesAsync();

            var controller = new UsuariosController(context);
            var result = await controller.Login(new LoginRequest { Username = "admin", Contrasena = "admin" });

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
        }

        [TestMethod]
        public async Task Login_Fail_ReturnsUnauthorized()
        {
            var context = GetContext();
            var controller = new UsuariosController(context);
            var result = await controller.Login(new LoginRequest { Username = "admin", Contrasena = "wrong" });

            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.IsNotNull(unauthorizedResult);
        }
    }
}
