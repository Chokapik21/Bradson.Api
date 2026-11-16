using Bradson.Api.Data;
using Bradson.Api.Dtos;
using Bradson.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalificacionesController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        public CalificacionesController(BradsonDbContext context) => _context = context;

        private static CalificacionDto ToDto(ClsCalificacion c) => new()
        { 
            Id = c.Id, 
            Puntuacion = c.Puntuacion, 
            Comentario = c.Comentario, 
            FechaRegistro = c.FechaRegistro, 
            IdReserva = c.IdReserva 
        };

        //GET: api/Calificacion
        //Obtiene las calififcaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CalificacionDto>>> GetAll()
        {
            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var query = _context.Calificaciones.AsNoTracking().AsQueryable();
            query = rol switch
            {
                nameof(RolUsuario.Cliente) => query.Where(c => c.Reserva.IdCliente == userId),
                nameof(RolUsuario.Trabajador) => query.Where(c => c.Reserva.IdTrabajador == userId),
                _ => query
            };

            return Ok((await query.ToListAsync()).Select(ToDto));
        }

        //GET: api/Calificacion/5
        //Obtiene una calificacion específica por su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<CalificacionDto>> GetById(int id)
        {
            var c = await _context.Calificaciones.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return c is null ? NotFound() : Ok(ToDto(c));
        }

        //POST: api/Calificacion
        //Agrega una calificacion a la reserva
        [Authorize(Roles = "Cliente")]
        [HttpPost]
        public async Task<ActionResult<CalificacionDto>> Create(CalificacionUpsertDto dto)
        {
            var reserva = await _context.Reservas.FindAsync(dto.IdReserva);
            if (reserva is null) return BadRequest("La reserva indicada no existe.");

            if (await _context.Calificaciones.AnyAsync(c => c.IdReserva == dto.IdReserva))
                return Conflict("Esta reserva ya tiene una calificación registrada.");

            var calificacion = new ClsCalificacion
            {
                Puntuacion = dto.Puntuacion,
                Comentario = dto.Comentario,
                IdReserva = dto.IdReserva,
                FechaRegistro = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _context.Calificaciones.Add(calificacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = calificacion.Id }, ToDto(calificacion));
        }

        //DELETE: api/Calificacion/5
        //Elimina una calificacion
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _context.Calificaciones.FindAsync(id);
            if (c is null) return NotFound();
            _context.Calificaciones.Remove(c);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
