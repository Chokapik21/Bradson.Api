using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bradson.Api.Models
{
    public enum DiaSemana { Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo }

    public class ClsDisponibilidad
    {
        public int Id { get; set; }

        public DiaSemana DiaSemana { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }

        // FK hacia Usuario (Trabajador)
        public int IdTrabajador { get; set; }
        [ForeignKey(nameof(IdTrabajador))]
        public ClsUsuario Trabajador { get; set; } = null!;
    }
}
