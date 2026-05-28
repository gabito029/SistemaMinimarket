using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Minimarket.Infrastructure.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Minimarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly DbMinimarketContext _context;

        public UsuariosController(DbMinimarketContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new
                {
                    u.Id,
                    u.Nombre,
                    u.Username,
                    u.Rol
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<IActionResult> CrearUsuario([FromBody] Minimarket.Domain.Entities.Usuario usuario)
        {
            if (string.IsNullOrEmpty(usuario.Contrasena))
            {
                usuario.Contrasena = "123456"; // Contraseña por defecto
            }
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(ObtenerUsuarios), new { id = usuario.Id }, usuario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarUsuario(int id, [FromBody] Minimarket.Domain.Entities.Usuario usuarioDto)
        {
            var u = await _context.Usuarios.FindAsync(id);
            if (u == null) return NotFound("Usuario no encontrado");

            u.Nombre = usuarioDto.Nombre;
            u.Username = usuarioDto.Username;
            u.Rol = usuarioDto.Rol;
            if (!string.IsNullOrEmpty(usuarioDto.Contrasena))
            {
                u.Contrasena = usuarioDto.Contrasena;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            var u = await _context.Usuarios.FindAsync(id);
            if (u == null) return NotFound("Usuario no encontrado");

            _context.Usuarios.Remove(u);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var u = await _context.Usuarios
                .FirstOrDefaultAsync(x => x.Username == request.Username && x.Contrasena == request.Contrasena);

            if (u == null) return Unauthorized("Usuario o contraseña incorrectos");

            return Ok(new
            {
                u.Id,
                u.Nombre,
                u.Username,
                u.Rol
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }
}
