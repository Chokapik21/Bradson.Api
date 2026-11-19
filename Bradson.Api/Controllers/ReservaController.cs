using Bradson.Api.Data;
using Bradson.Api.Dtos;
using Bradson.Api.Models;
using Bradson.Api.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservaController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        private const decimal PorcentajeComision = 0.20m;

        public ReservaController(BradsonDbContext context) => _context = context;

        private static ReservaDto ToDto(ClsReserva r) => new()
        {
            Id = r.Id,
            Fecha = r.Fecha,
            Hora = r.Hora,
            Estado = r.Estado.ToString(),
            PrecioTotal = r.PrecioTotal,
            Direccion = r.Direccion,
            Referencia = r.Referencia,
            IdCliente = r.IdCliente,
            IdTrabajador = r.IdTrabajador,
            IdServicio = r.IdServicio,
            NombreServicio = r.Servicio?.NombreCategoria ?? string.Empty,
            NombreCliente = r.Cliente?.Nombre,
            NombreTrabajador = r.Trabajador?.Nombre,
            TelefonoTrabajador = r.Trabajador?.Telefono,
            TelefonoCliente = r.Cliente?.Telefono,
            FotoTrabajador = r.Trabajador?.FotoPerfil,
            FotoCliente = r.Cliente?.FotoPerfil
        };

        //GET: api/Reserva
        //Obtiene las reservas existentes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaDto>>> GetAll()
        {
            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var query = _context.Reservas
                .Include(r => r.Servicio)
                .Include(r => r.Cliente)
                .Include(r => r.Trabajador)
                .AsNoTracking()
                .AsQueryable();

            query = rol switch
            {
                nameof(RolUsuario.Cliente) => query.Where(r => r.IdCliente == userId),
                nameof(RolUsuario.Trabajador) => query.Where(r => r.IdTrabajador == userId),
                _ => query // Administrador ve todo
            };

            return Ok((await query.ToListAsync()).Select(ToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReservaDto>> GetById(int id)
        {
            var r = await _context.Reservas
                .Include(r => r.Servicio)
                .Include(r => r.Cliente)
                .Include(r => r.Trabajador)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
            return r is null ? NotFound() : Ok(ToDto(r));
        }

        // El diferenciador del pitch: solo trabajadores a <=10 km Y disponibles ese día/hora.
        [Authorize(Roles = "Cliente")]
        [HttpGet("trabajadores-disponibles")]
        public async Task<ActionResult<IEnumerable<TrabajadorDisponibleDto>>> BuscarTrabajadoresDisponibles(
            [FromQuery] decimal lat, [FromQuery] decimal lon,
            [FromQuery] string diaSemana, [FromQuery] TimeOnly hora)
        {
            if (!Enum.TryParse<DiaSemana>(diaSemana, out var dia))
                return BadRequest($"Día inválido. Valores permitidos: {string.Join(", ", Enum.GetNames<DiaSemana>())}");

            var candidatos = await _context.Usuarios
                .AsNoTracking()
                .Where(u => u.Rol == RolUsuario.Trabajador
                         && u.EstadoCuenta == "activa"
                         && u.Verificado
                         && u.Latitud != null && u.Longitud != null
                         && u.Disponibilidades.Any(d => d.DiaSemana == dia && d.HoraInicio <= hora && d.HoraFin >= hora))
                .ToListAsync();

            var resultado = candidatos
                .Select(u => new TrabajadorDisponibleDto
                {
                    IdTrabajador = u.Id,
                    Nombre = u.Nombre,
                    DistanciaKm = GeoUtils.CalcularDistanciaKm((double)lat, (double)lon, (double)u.Latitud!, (double)u.Longitud!),
                    FotoPerfil = u.FotoPerfil
                })
                .OrderBy(t => t.DistanciaKm)
                .ToList();

            return Ok(resultado);
        }

        //POST: api/Reserva
        //agrega una reserva generada por cliente
        // ReservasController.cs — reemplaza el método Create completo:
        [Authorize(Roles = "Cliente")]
        [HttpPost]
        public async Task<ActionResult<ReservaDto>> Create(ReservaCreateDto dto)
        {
            var idCliente = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);   // ya no viene del body

            var trabajador = await _context.Usuarios.FindAsync(dto.IdTrabajador);
            if (trabajador is null || trabajador.Rol != RolUsuario.Trabajador) return BadRequest("IdTrabajador inválido.");

            var servicio = await _context.Servicios.FindAsync(dto.IdServicio);
            if (servicio is null) return BadRequest("El servicio indicado no existe.");

            // Evitar solapamientos: el trabajador no puede tener dos servicios al mismo tiempo
            var solapada = await _context.Reservas.AnyAsync(r =>
                r.IdTrabajador == dto.IdTrabajador &&
                r.Fecha == dto.Fecha &&
                r.Hora == dto.Hora &&
                r.Estado != EstadoReserva.Cancelado);
            if (solapada)
                return Conflict("El trabajador seleccionado ya tiene una reserva agendada en esa misma fecha y hora.");

            var reserva = new ClsReserva
            {
                Fecha = dto.Fecha,
                Hora = dto.Hora,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                Direccion = dto.Direccion,
                Referencia = dto.Referencia,
                IdCliente = idCliente,
                IdTrabajador = dto.IdTrabajador,
                IdServicio = dto.IdServicio,
                PrecioTotal = servicio.TarifaBase,
                Estado = EstadoReserva.Pendiente
            };

            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            reserva.Servicio = servicio;
            reserva.Trabajador = trabajador;

            return CreatedAtAction(nameof(GetById), new { id = reserva.Id }, ToDto(reserva));
        }

        // Máquina de estados explícita en vez de un PUT genérico que permita cualquier salto.
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, ReservaEstadoDto dto)
        {
            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva is null) return NotFound();

            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Solo el cliente o el trabajador de ESTA reserva pueden cambiarle el estado.
            if (rol != nameof(RolUsuario.Administrador) && reserva.IdCliente != userId && reserva.IdTrabajador != userId)
                return Forbid();

            if (!Enum.TryParse<EstadoReserva>(dto.Estado, out var nuevoEstado))
                return BadRequest($"Estado inválido. Valores permitidos: {string.Join(", ", Enum.GetNames<EstadoReserva>())}");

            reserva.Estado = nuevoEstado;

            // Transparencia financiera del pitch: al finalizar, se genera el Pago con 20%/80% automático.
            if (nuevoEstado == EstadoReserva.Finalizado && !await _context.Pagos.AnyAsync(p => p.IdReserva == reserva.Id))
            {
                var comision = Math.Round(reserva.PrecioTotal * PorcentajeComision, 2);
                _context.Pagos.Add(new ClsPago
                {
                    IdReserva = reserva.Id,
                    MontoBruto = reserva.PrecioTotal,
                    ComisionApp = comision,
                    MontoNeto = reserva.PrecioTotal - comision,
                    EstadoPago = EstadoPago.Pendiente
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
