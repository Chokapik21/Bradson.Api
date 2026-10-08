using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class CalificacionDto
    {
        public int Id { get; set; }
        public byte Puntuacion { get; set; }
        public string? Comentario { get; set; }
        public DateOnly FechaRegistro { get; set; }
        public int IdReserva { get; set; }
    }

    public class CalificacionUpsertDto
    {
        [Range(1, 5)]
        public byte Puntuacion { get; set; }

        [MaxLength(500)]
        public string? Comentario { get; set; }

        [Required]
        public int IdReserva { get; set; }
    }
}
