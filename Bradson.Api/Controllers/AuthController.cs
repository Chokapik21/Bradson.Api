using Bradson.Api.Data;
using Bradson.Api.Dtos;
using Bradson.Api.Models;
using Bradson.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        private readonly TokenService _tokenService;
        private readonly PasswordHasher<ClsUsuario> _hasher = new();

        public AuthController(BradsonDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == dto.Correo);

            // Mismo mensaje si el correo no existe o si la contraseña está mal:
            // no le confirmamos a nadie cuáles correos sí están registrados.
            if (usuario is null)
                return Unauthorized("Correo o contraseña incorrectos.");

            var resultado = _hasher.VerifyHashedPassword(usuario, usuario.ContrasenaHash, dto.Password);
            if (resultado == PasswordVerificationResult.Failed)
                return Unauthorized("Correo o contraseña incorrectos.");

            if (usuario.EstadoCuenta != "activa")
                return Unauthorized("Esta cuenta está suspendida. Contacta a soporte.");

            var (token, expiracion) = _tokenService.GenerarToken(usuario);

            return Ok(new AuthResponseDto
            {
                Token = token,
                ExpiracionUtc = expiracion,
                Usuario = new UsuarioDto
                {
                    Id = usuario.Id,
                    Nombre = usuario.Nombre,
                    Documento = usuario.Documento,
                    Correo = usuario.Correo,
                    Telefono = usuario.Telefono,
                    EstadoCuenta = usuario.EstadoCuenta,
                    Verificado = usuario.Verificado,
                    Rol = usuario.Rol.ToString(),
                    Latitud = usuario.Latitud,
                    Longitud = usuario.Longitud,
                    Direccion = usuario.Direccion
                }
            });
        }
    }
}