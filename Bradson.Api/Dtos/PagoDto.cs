using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class PagoDto
    {
        public int Id { get; set; }
        public decimal MontoBruto { get; set; }
        public decimal ComisionApp { get; set; }
        public decimal MontoNeto { get; set; }
        public string MetodoPago { get; set; } = string.Empty;
        public string EstadoPago { get; set; } = string.Empty;
        public DateTime? FechaPago { get; set; }
        public int IdReserva { get; set; }
    }

    public class PagoProcesarDto
    {
        [Required]
        public string MetodoPago { get; set; } = string.Empty; // "Tarjeta" | "PSE" | "Efectivo" | "Otro"
    }
}
