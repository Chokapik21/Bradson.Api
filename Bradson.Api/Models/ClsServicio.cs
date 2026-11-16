using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Bradson.Api.Models
{
    public class ClsServicio
    {
        public int Id { get; set; }

        [MaxLength(100)]
        public string NombreCategoria { get; set; } = string.Empty; //"Aseo", "Decoración"...

        [Column(TypeName = "text")]
        public string Descripcion { get; set; } = string.Empty;//el diccionario lo marca como Text, sin límite fijo

        [Column(TypeName = "decimal(10,2)")]
        public decimal TarifaBase { get; set; }
        
        public ICollection<ClsReserva> Reservas { get; set; } = new List<ClsReserva>();
    }
}
