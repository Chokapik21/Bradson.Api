using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Documento { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string EstadoCuenta { get; set; } = string.Empty;
        public bool Verificado { get; set; }
        public string Rol { get; set; } = string.Empty;
        // Zona base del Trabajador (null para Clientes)
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public string? Direccion { get; set; }
    }

    public class UsuarioRegistroDto
    {
        [Required, MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Documento { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Correo { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        public string Rol { get; set; } = string.Empty; //"Cliente" | "Trabajador" | "Administrador"
    }

    public class UsuarioUpdateDto
    {
        [Required, MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Telefono { get; set; } = string.Empty;

        public string? FotoPerfil { get; set; }

        // Campos opcionales para que el Trabajador guarde su zona base de operación.
        // Un Cliente puede enviarlos null sin problema; solo se aplican si no son null.
        [Range(-90.0, 90.0)]
        public decimal? Latitud { get; set; }

        [Range(-180.0, 180.0)]
        public decimal? Longitud { get; set; }

        [MaxLength(300)]
        public string? Direccion { get; set; }
    }
}
