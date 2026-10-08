using System.ComponentModel.DataAnnotations.Schema;

namespace Bradson.Api.Models
{
    public enum MetodoPago { Tarjeta, PSE, Efectivo, Otro }
    public enum EstadoPago { Pendiente, Completado, Fallido, Reembolsado }
    public class ClsPago
    {
        public int Id { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MontoBruto { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal ComisionApp { get; set; } //20% automático de la app

        [Column(TypeName = "decimal(10,2)")]
        public decimal MontoNeto { get; set; } //80% restante para el prestador
        public MetodoPago MetodoPago { get; set; }
        public EstadoPago EstadoPago { get; set; } = EstadoPago.Pendiente;

        public DateTime? FechaPago { get; set; }

        //FK hacia Reserva
        public int IdReserva { get; set; }
        public ClsReserva Reserva { get; set; } = null!;

        //Relación 1 a 1 hacia DetallePago 
        public ClsDetallePago? DetallePago { get; set; }
    }
}
