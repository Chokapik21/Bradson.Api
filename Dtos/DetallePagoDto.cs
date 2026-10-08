namespace Bradson.Api.Dtos
{
    public class DetallePagoDto
    {
        public int Id { get; set; }
        public string Pasarela { get; set; } = string.Empty;
        public string ReferenciaTransaccion { get; set; } = string.Empty;
        public string? TokenTransaccion { get; set; }
        public string? CodigoRespuesta { get; set; }
        public DateTime FechaRespuesta { get; set; }
        public int IdPago { get; set; }
    }
}
