namespace Bradson.Api.Utils
{
    public record RespuestaPasarela(bool Exitoso, string ReferenciaTransaccion, string Token, string CodigoRespuesta);

    public class PasarelaSimulada
    {
        private static readonly Random _rng = new();

        //genera referencia y token con formato realista
        //(como pasaría con tarjetas reales rechazadas por fondos, vencimiento, etc.).
        public static RespuestaPasarela Procesar(decimal monto, bool? forzarExito = null)
        {
            var referencia = $"BRD-{DateTime.UtcNow:yyyyMMddHHmmss}-{_rng.Next(1000, 9999)}";
            var token = Guid.NewGuid().ToString("N");
            bool exitoso = forzarExito ?? (_rng.Next(1, 101) <= 90);
            string codigo = exitoso ? "00" : "05"; // convención típica: 00 = aprobado

            return new RespuestaPasarela(exitoso, referencia, token, codigo);
        }
    }
}
