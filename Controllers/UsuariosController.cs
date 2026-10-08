using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bradson.Api.Data;
using Bradson.Api.Models;
using Bradson.Api.Dtos;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        private readonly PasswordHasher<ClsUsuario> _hasher = new();

        public UsuariosController(BradsonDbContext context) => _context = context;

        private static UsuarioDto ToDto(ClsUsuario u) => new()
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Documento = u.Documento,
            Correo = u.Correo,
            Telefono = u.Telefono,
            EstadoCuenta = u.EstadoCuenta,
            Verificado = u.Verificado,
            Rol = u.Rol.ToString()
        };

        //GET: api/Usuarios
        //Obtiene la lista completa de usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
        {
            var usuarios = await _context.Usuarios.AsNoTracking().ToListAsync();
            return Ok(usuarios.Select(ToDto));
        }

        //GET: api/Servicios/5
        //Obtiene un usuario específico por su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetById(int id)
        {
            var u = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return u is null ? NotFound() : Ok(ToDto(u));
        }

        //POST: api/Usuarios
        //Crea un nuevo usuario o tipo de usuario
        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> Create(UsuarioRegistroDto dto)
        {
            if (!Enum.TryParse<RolUsuario>(dto.Rol, out var rol))
                return BadRequest($"Rol inválido. Valores permitidos: {string.Join(", ", Enum.GetNames<RolUsuario>())}");

            if (await _context.Usuarios.AnyAsync(u => u.Correo == dto.Correo))
                return Conflict("Ya existe un usuario registrado con ese correo.");

            var usuario = new ClsUsuario
            {
                Nombre = dto.Nombre,
                Documento = dto.Documento,
                Correo = dto.Correo,
                Telefono = dto.Telefono,
                Rol = rol,
                EstadoCuenta = "activa",
                Verificado = false
            };
            usuario.ContrasenaHash = _hasher.HashPassword(usuario, dto.Password);

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, ToDto(usuario));
        }

        //PUT: api/Usuarios/5
        //Actualiza los datos de los usuarios existentes
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UsuarioUpdateDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            usuario.Nombre = dto.Nombre;
            usuario.Telefono = dto.Telefono;
            usuario.FotoPerfil = dto.FotoPerfil;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //DELETE: api/Usuarios/5
        //Elimina un usuario, este no debe tener servicios asociados
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            _context.Usuarios.Remove(usuario);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                //tiene reservas asociadas.
                return Conflict("No se puede eliminar: el usuario tiene reservas asociadas. Usa el PUT para marcarlo como 'suspendida' en su lugar.");
            }
            return NoContent();
        }
    }
}
