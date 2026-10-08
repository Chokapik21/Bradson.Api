using System.ComponentModel.DataAnnotations;

namespace Bradson.Api.Dtos
{
    public class ServicioDto
    {
        public int Id { get; set; }
        public string NombreCategoria { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal TarifaBase { get; set; }
    }

    public class ServicioUpsertDto
    {
        [Required, MaxLength(100)]
        public string NombreCategoria { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Range(0, 99999999.99)]
        public decimal TarifaBase { get; set; }
    }
}
