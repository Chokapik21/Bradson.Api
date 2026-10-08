using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bradson.Api.Models
{
    public enum EstadoSolucion { Abierta, EnProceso, Resuelta, Cerrada }

    public class ClsIncidencia
    {
        public int Id { get; set; }

        [MaxLength(100)]
        public string TipoNovedad { get; set; } = string.Empty; //"Inasistencia", "Accidente"

        [Column(TypeName = "text")]
        public string Descripcion { get; set; } = string.Empty;

        public EstadoSolucion EstadoSolucion { get; set; } = EstadoSolucion.Abierta;

        //FK hacia Reserva
        public int IdReserva { get; set; }
        public ClsReserva Reserva { get; set; } = null!;
    }
}
