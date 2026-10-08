using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class ReservaDto
    {
        public int Id { get; set; }
        public DateOnly Fecha { get; set; }
        public TimeOnly Hora { get; set; }
        public string Estado { get; set; } = string.Empty;
        public decimal PrecioTotal { get; set; }
        public string Direccion { get; set; } = string.Empty;
        public string? Referencia { get; set; }
        public int IdCliente { get; set; }
        public int IdTrabajador { get; set; }
        public int IdServicio { get; set; }
    }

    public class ReservaCreateDto
    {
        [Required] public DateOnly Fecha { get; set; }
        [Required] public TimeOnly Hora { get; set; }
        [Required] public decimal Latitud { get; set; }
        [Required] public decimal Longitud { get; set; }
        [Required, MaxLength(255)] public string Direccion { get; set; } = string.Empty;
        public string? Referencia { get; set; }
        [Required] public int IdCliente { get; set; }
        [Required] public int IdTrabajador { get; set; }
        [Required] public int IdServicio { get; set; }
    }

    public class ReservaEstadoDto
    {
        [Required] public string Estado { get; set; } = string.Empty;
    }

    public class TrabajadorDisponibleDto
    {
        public int IdTrabajador { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public double DistanciaKm { get; set; }
    }
}