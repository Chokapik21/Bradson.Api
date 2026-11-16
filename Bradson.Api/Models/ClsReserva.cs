using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Bradson.Api.Models
{
    public enum EstadoReserva { Pendiente, EnCurso, Finalizado, Cancelado }

    public class ClsReserva
    {
        public int Id { get; set; }

        public DateOnly Fecha { get; set; }//tipo dedicado para "solo fecha"
        public TimeOnly Hora { get; set; }//tipo dedicado para "solo hora"

        [Column(TypeName = "decimal(9,6)")]
        public decimal Latitud { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal Longitud { get; set; }

        public EstadoReserva Estado { get; set; } = EstadoReserva.Pendiente;

        [Column(TypeName = "decimal(10,2)")]
        public decimal PrecioTotal { get; set; }

        [MaxLength(255)]
        public string Direccion { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Referencia { get; set; }//nullable: no toda reserva trae referencia ("2do piso", etc.)

        //FKs distintas hacia Usuario
        public int IdCliente { get; set; }
        [ForeignKey(nameof(IdCliente))]
        public ClsUsuario Cliente { get; set; } = null!;

        public int IdTrabajador { get; set; }
        [ForeignKey(nameof(IdTrabajador))]
        public ClsUsuario Trabajador { get; set; } = null!;

        //FK hacia Servicio
        public int IdServicio { get; set; }
        [ForeignKey(nameof(IdServicio))]
        public ClsServicio Servicio { get; set; } = null!;

        //Relaciones "hijas"
        public ClsPago? Pago { get; set; }
        public ClsCalificacion? Calificacion { get; set; }
        public ICollection<ClsIncidencia> Incidencias { get; set; } = new List<ClsIncidencia>();
    }
}
