using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class DisponibilidadDto
    {
        public int Id { get; set; }
        public string DiaSemana { get; set; } = string.Empty;
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public int IdTrabajador { get; set; }
    }

    public class DisponibilidadUpsertDto
    {
        [Required]
        public string DiaSemana { get; set; } = string.Empty;

        [Required]
        public TimeOnly HoraInicio { get; set; }

        [Required]
        public TimeOnly HoraFin { get; set; }

        [Required]
        public int IdTrabajador { get; set; }
    }
}
