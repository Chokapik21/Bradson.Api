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
    [Route("api/disponibilidades")]
    public class DisponibilidadController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        public DisponibilidadController(BradsonDbContext context) => _context = context;

        private static DisponibilidadDto ToDto(ClsDisponibilidad d) => new()
        { 
            Id = d.Id, 
            DiaSemana = d.DiaSemana.ToString(), 
            HoraInicio = d.HoraInicio, 
            HoraFin = d.HoraFin, 
            IdTrabajador = d.IdTrabajador 
        };

        //GET: api/Disponibilidad
        //Obtiene las disponibilidades de los trabajadores
        [Authorize(Roles = "Trabajador,Administrador")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DisponibilidadDto>>> GetAll()
        {
            var rol = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var query = _context.Disponibilidades.AsNoTracking().AsQueryable();
            if (rol == nameof(RolUsuario.Trabajador))
                query = query.Where(d => d.IdTrabajador == userId);

            return Ok((await query.ToListAsync()).Select(ToDto));
        }

        //POST: api/Disponibilidad
        //un trabajador agrega modo disponible
        [Authorize(Roles = "Trabajador")]
        [HttpPost]
        public async Task<ActionResult<DisponibilidadDto>> Create(DisponibilidadUpsertDto dto)
        {
            if (!Enum.TryParse<DiaSemana>(dto.DiaSemana, out var dia))
                return BadRequest($"Día inválido. Valores permitidos: {string.Join(", ", Enum.GetNames<DiaSemana>())}");

            var trabajador = await _context.Usuarios.FindAsync(dto.IdTrabajador);
            if (trabajador is null) return BadRequest("El trabajador indicado no existe.");
            if (trabajador.Rol != RolUsuario.Trabajador) return BadRequest("Solo los usuarios con rol Trabajador pueden tener disponibilidad.");

            if (dto.HoraInicio >= dto.HoraFin) return BadRequest("La hora de inicio debe ser menor que la hora de fin.");

            var disponibilidad = new ClsDisponibilidad
            { DiaSemana = dia, HoraInicio = dto.HoraInicio, HoraFin = dto.HoraFin, IdTrabajador = dto.IdTrabajador };
            _context.Disponibilidades.Add(disponibilidad);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), ToDto(disponibilidad));
        }


        //DELETE: api/Disponibilidad/5
        //Elimina una disponibilidad
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var d = await _context.Disponibilidades.FindAsync(id);
            if (d is null) return NotFound();
            _context.Disponibilidades.Remove(d);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
