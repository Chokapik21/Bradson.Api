using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bradson.Api.Data;
using Bradson.Api.Dtos;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DetallePagoController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        public DetallePagoController(BradsonDbContext context) => _context = context;

        private static DetallePagoDto ToDto(Models.ClsDetallePago d) => new()
        {
            Id = d.Id,
            Pasarela = d.Pasarela,
            ReferenciaTransaccion = d.ReferenciaTransaccion,
            TokenTransaccion = d.TokenTransaccion,
            CodigoRespuesta = d.CodigoRespuesta,
            FechaRespuesta = d.FechaRespuesta,
            IdPago = d.IdPago
        };

        //GET: se queda como solo lectura, no se crea ni edita desde afuera
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetallePagoDto>>> GetAll() =>
            Ok((await _context.DetallesPago.AsNoTracking().ToListAsync()).Select(ToDto));

        //Obtiene los detalle de pagos
        [HttpGet("{id}")]
        public async Task<ActionResult<DetallePagoDto>> GetById(int id)
        {
            var d = await _context.DetallesPago.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return d is null ? NotFound() : Ok(ToDto(d));
        }

        //Obtiene los detalle de pagos realizados por reserva
        [HttpGet("pago/{idPago}")]
        public async Task<ActionResult<DetallePagoDto>> GetByPago(int idPago)
        {
            var d = await _context.DetallesPago.AsNoTracking().FirstOrDefaultAsync(x => x.IdPago == idPago);
            return d is null ? NotFound() : Ok(ToDto(d));
        }
    }
}
