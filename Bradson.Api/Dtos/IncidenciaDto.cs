using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class IncidenciaDto
    {
        public int Id { get; set; }
        public string TipoNovedad { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string EstadoSolucion { get; set; } = string.Empty;
        public int IdReserva { get; set; }
    }

    public class IncidenciaCreateDto
    {
        [Required, MaxLength(100)]
        public string TipoNovedad { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public int IdReserva { get; set; }
    }

    public class IncidenciaEstadoDto
    {
        [Required]
        public string EstadoSolucion { get; set; } = string.Empty; // "Abierta" | "EnProceso" | "Resuelta" | "Cerrada"
    }
}
