using Bradson.Api.Data;
using Bradson.Api.Dtos;
using Bradson.Api.Models;
using Bradson.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        private readonly TokenService _tokenService;
        private readonly PasswordHasher<ClsUsuario> _hasher = new();
        public UsuariosController(BradsonDbContext context, TokenService tokenService) // Constructor que recibe el contexto de la base de datos y el servicio de token
        {
            _context = context;
            _tokenService = tokenService;
        }

        private static UsuarioDto ToDto(ClsUsuario u) => new()
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Documento = u.Documento,
            Correo = u.Correo,
            Telefono = u.Telefono,
            EstadoCuenta = u.EstadoCuenta,
            Verificado = u.Verificado,
            Rol = u.Rol.ToString(),
            Latitud = u.Latitud,
            Longitud = u.Longitud,
            Direccion = u.Direccion
        };

        //GET: api/Usuarios
        //Obtiene la lista completa de usuarios (solo Administrador)
        [Authorize(Roles = "Administrador")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
        {
            var usuarios = await _context.Usuarios.AsNoTracking().ToListAsync();
            return Ok(usuarios.Select(ToDto));
        }

        //GET: api/Usuarios/5
        //Obtiene un usuario específico por su ID (solo el titular o Administrador)
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetById(int id)
        {
            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (rol != nameof(RolUsuario.Administrador) && userId != id)
                return Forbid();

            var u = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return u is null ? NotFound() : Ok(ToDto(u));
        }

        //POST: api/Usuarios
        //Crea un nuevo usuario o tipo de usuario
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<AuthResponseDto>> Create(UsuarioRegistroDto dto)
        {
            // Solo se puede registrar Cliente o Trabajador. Esto también cubre
            // valores numéricos inventados ("99") y el intento de crear un Administrador.
            if (!Enum.TryParse<RolUsuario>(dto.Rol, true, out var rol)
                || (rol != RolUsuario.Cliente && rol != RolUsuario.Trabajador))
                return BadRequest("Rol inválido. Valores permitidos para el registro: Cliente, Trabajador.");

            if (await _context.Usuarios.AnyAsync(u => u.Correo == dto.Correo))
                return Conflict("Ya existe un usuario registrado con ese correo.");

            if (await _context.Usuarios.AnyAsync(u => u.Documento == dto.Documento))
                return Conflict("Ya existe un usuario registrado con ese documento.");

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

            var (token, expiracion) = _tokenService.GenerarToken(usuario);

            return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, new AuthResponseDto
            {
                Token = token,
                ExpiracionUtc = expiracion,
                Usuario = ToDto(usuario)
            });
        }

        //PUT: api/Usuarios/5
        //Actualiza los datos de los usuarios existentes
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UsuarioUpdateDto dto)
        {
            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Solo puedes editar tu propio perfil, salvo que seas Administrador.
            if (rol != nameof(RolUsuario.Administrador) && userId != id)
                return Forbid();

            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            usuario.Nombre = dto.Nombre;
            usuario.Telefono = dto.Telefono;
            usuario.FotoPerfil = dto.FotoPerfil;

            // Solo se actualiza la ubicación base si el usuario que edita es Trabajador
            // y si se envían valores no nulos. Así un Cliente puede hacer PUT sin romper nada.
            if (usuario.Rol == RolUsuario.Trabajador)
            {
                if (dto.Latitud.HasValue) usuario.Latitud = dto.Latitud;
                if (dto.Longitud.HasValue) usuario.Longitud = dto.Longitud;
                if (dto.Direccion is not null) usuario.Direccion = dto.Direccion;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //DELETE: api/Usuarios/5
        //Elimina un usuario, este no debe tener servicios asociados
        [Authorize(Roles = "Administrador")]
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
