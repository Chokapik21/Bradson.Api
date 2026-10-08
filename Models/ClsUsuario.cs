using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Bradson.Api.Models
{
    public enum RolUsuario
    {
        Cliente = 1,
        Trabajador = 2,
        Administrador = 3
    }

    public class ClsUsuario
    {
        public int Id { get; set; }            

        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Documento { get; set; } = string.Empty;

        [MaxLength(150)]
        public string Correo { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ContrasenaHash { get; set; } = string.Empty;//nunca se guarda la contraseña en texto plano

        [MaxLength(255)]
        public string? FotoPerfil { get; set; }//nullable: no todo usuario sube foto al registrarse

        [MaxLength(20)]
        public string Telefono { get; set; } = string.Empty;

        [MaxLength(20)]
        public string EstadoCuenta { get; set; } = "activa";//"activa" | "suspendida"

        public bool Verificado { get; set; }

        public RolUsuario Rol { get; set; }

        [InverseProperty(nameof(ClsReserva.Cliente))]
        public ICollection<ClsReserva> ReservasComoCliente { get; set; } = new List<ClsReserva>();

        [InverseProperty(nameof(ClsReserva.Trabajador))]
        public ICollection<ClsReserva> ReservasComoTrabajador { get; set; } = new List<ClsReserva>();
        public ICollection<ClsDisponibilidad> Disponibilidades { get; set; } = new List<ClsDisponibilidad>();

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Latitud { get; set; }   //un Cliente no necesita ubicación base

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Longitud { get; set; }  //solo se usa realmente si Rol == Trabajador
    }
}
