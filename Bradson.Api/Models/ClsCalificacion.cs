using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Models
{
    public class ClsCalificacion
    {
        public int Id { get; set; }

        [Range(1, 5)]
        public byte Puntuacion { get; set; } //(1 a 5 estrellas)

        [MaxLength(255)]
        public string? Comentario { get; set; } //Feedback opcional

        public DateOnly FechaRegistro { get; set; }

        //FK hacia Reserva (1 a 1)
        public int IdReserva { get; set; }
        public ClsReserva Reserva { get; set; } = null!;
    }
}
