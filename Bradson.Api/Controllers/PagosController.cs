using Bradson.Api.Data;
using Bradson.Api.Dtos;
using Bradson.Api.Models;
using Bradson.Api.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
        public async Task<ActionResult<IEnumerable<PagoDto>>> GetAll()
        {
            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var query = _context.Pagos.AsNoTracking().AsQueryable();
            query = rol switch
            {
                nameof(RolUsuario.Cliente) => query.Where(p => p.Reserva.IdCliente == userId),
                nameof(RolUsuario.Trabajador) => query.Where(p => p.Reserva.IdTrabajador == userId),
                _ => query
            };

            return Ok((await query.ToListAsync()).Select(ToDto));
        }


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
            var pago = await _context.Pagos
                .Include(p => p.DetallePago)
                .Include(p => p.Reserva)          //lo necesitamos para IdCliente/IdTrabajador
                .FirstOrDefaultAsync(p => p.Id == id);
            if (pago is null) return NotFound();

            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (rol != nameof(RolUsuario.Administrador) && pago.Reserva.IdCliente != userId && pago.Reserva.IdTrabajador != userId)
                return Forbid();

            // Solo se bloquea si ya está Completado o Reembolsado; si está Pendiente o Fallido se permite (re)procesar.
            if (pago.EstadoPago == EstadoPago.Completado)
                return Conflict("Este pago ya fue completado exitosamente.");

            if (pago.EstadoPago == EstadoPago.Reembolsado)
                return Conflict("Este pago ya fue reembolsado.");

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

                if (pago.DetallePago is not null)
                {
                    // Reutilizar registro si es un reintento tras fallo previo
                    pago.DetallePago.Pasarela = "Simulada";
                    pago.DetallePago.ReferenciaTransaccion = respuesta.ReferenciaTransaccion;
                    pago.DetallePago.TokenTransaccion = respuesta.Token;
                    pago.DetallePago.CodigoRespuesta = respuesta.CodigoRespuesta;
                    pago.DetallePago.FechaRespuesta = DateTime.UtcNow;
                }
                else
                {
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
            }

            await _context.SaveChangesAsync();
            return Ok(ToDto(pago));
        }
    }
}
