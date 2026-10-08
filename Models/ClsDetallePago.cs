using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bradson.Api.Models
{
    public class ClsDetallePago
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string Pasarela { get; set; } = "Simulada";

        [MaxLength(100)]
        public string ReferenciaTransaccion { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? TokenTransaccion { get; set; }

        [MaxLength(20)]
        public string? CodigoRespuesta { get; set; }

        public DateTime FechaRespuesta { get; set; }

        public int IdPago { get; set; }
        [ForeignKey(nameof(IdPago))]
        public ClsPago Pago { get; set; } = null!;
    }
}
