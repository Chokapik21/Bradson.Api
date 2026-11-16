using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class LoginDto
    {
        [Required, EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiracionUtc { get; set; }
        public UsuarioDto Usuario { get; set; } = null!;
    }
}