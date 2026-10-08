using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bradson.Api.Data;
using Bradson.Api.Models;
using Bradson.Api.Dtos;
using Bradson.Api.Utils;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagosController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        public PagosController(BradsonDbContext context) => _context = context;

        private static PagoDto ToDto(ClsPago p) => new()
        {
            Id = p.Id,
            MontoBruto = p.MontoBruto,
            ComisionApp = p.ComisionApp,
            MontoNeto = p.MontoNeto,
            MetodoPago = p.MetodoPago.ToString(),
            EstadoPago = p.EstadoPago.ToString(),
            FechaPago = p.FechaPago,
            IdReserva = p.IdReserva
        };

        //GET: api/Pagos
        //Obtiene los pagos realizados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PagoDto>>> GetAll() =>
            Ok((await _context.Pagos.AsNoTracking().ToListAsync()).Select(ToDto));


        //GET: api/Pagos/5
        //Obtiene los pagos especificos por id
        [HttpGet("{id}")]
        public async Task<ActionResult<PagoDto>> GetById(int id)
        {
            var p = await _context.Pagos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return p is null ? NotFound() : Ok(ToDto(p));
        }

        //GET: api/Pagos/Reserva/5
        //Obtiene los pagos realizados vinculados a una reserva
        [HttpGet("reserva/{idReserva}")]
        public async Task<ActionResult<PagoDto>> GetByReserva(int idReserva)
        {
            var p = await _context.Pagos.AsNoTracking().FirstOrDefaultAsync(x => x.IdReserva == idReserva);
            return p is null ? NotFound() : Ok(ToDto(p));
        }

        // Toma un Pago Pendiente (creado automáticamente al finalizar la Reserva,
        [HttpPatch("{id}/procesar")]
        public async Task<ActionResult<PagoDto>> Procesar(int id, PagoProcesarDto dto, [FromQuery] bool? forzarExito = null)
        {
            var pago = await _context.Pagos.Include(p => p.DetallePago).FirstOrDefaultAsync(p => p.Id == id);
            if (pago is null) return NotFound();

            if (pago.EstadoPago != EstadoPago.Pendiente)
                return Conflict($"Este pago ya fue procesado (estado actual: {pago.EstadoPago}).");

            if (!Enum.TryParse<MetodoPago>(dto.MetodoPago, out var metodo))
                return BadRequest($"Método inválido. Valores permitidos: {string.Join(", ", Enum.GetNames<MetodoPago>())}");

            pago.MetodoPago = metodo;
            pago.FechaPago = DateTime.UtcNow;

            if (metodo == MetodoPago.Efectivo)
            {
                pago.EstadoPago = EstadoPago.Completado; // efectivo no pasa por pasarela
            }
            else
            {
                var respuesta = PasarelaSimulada.Procesar(pago.MontoBruto, forzarExito);
                pago.EstadoPago = respuesta.Exitoso ? EstadoPago.Completado : EstadoPago.Fallido;

                _context.DetallesPago.Add(new ClsDetallePago
                {
                    IdPago = pago.Id,
                    Pasarela = "Simulada",
                    ReferenciaTransaccion = respuesta.ReferenciaTransaccion,
                    TokenTransaccion = respuesta.Token,
                    CodigoRespuesta = respuesta.CodigoRespuesta,
                    FechaRespuesta = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return Ok(ToDto(pago));
        }

    }
}
