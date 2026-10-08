using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bradson.Api.Data;
using Bradson.Api.Models;
using Bradson.Api.Dtos;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncidenciaController : ControllerBase
    {
        private readonly BradsonDbContext _context;
        public IncidenciaController(BradsonDbContext context) => _context = context;

        private static IncidenciaDto ToDto(ClsIncidencia i) => new()
        { 
            Id = i.Id, 
            TipoNovedad = i.TipoNovedad, 
            Descripcion = i.Descripcion, 
            EstadoSolucion = i.EstadoSolucion.ToString(), 
            IdReserva = i.IdReserva 
        };

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncidenciaDto>>> GetAll() =>
            Ok((await _context.Incidencias.AsNoTracking().ToListAsync()).Select(ToDto));

        //GET: api/Incidencias/5
        //Obtiene las incidencias
        [HttpGet("{id}")]
        public async Task<ActionResult<IncidenciaDto>> GetById(int id)
        {
            var i = await _context.Incidencias.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return i is null ? NotFound() : Ok(ToDto(i));
        }

        //POST: api/Incidencias
        //Agrega una incidencia relacionada con la reserva
        [HttpPost]
        public async Task<ActionResult<IncidenciaDto>> Create(IncidenciaCreateDto dto)
        {
            if (!await _context.Reservas.AnyAsync(r => r.Id == dto.IdReserva))
                return BadRequest("La reserva indicada no existe.");

            var incidencia = new ClsIncidencia
            {
                TipoNovedad = dto.TipoNovedad,
                Descripcion = dto.Descripcion,
                IdReserva = dto.IdReserva,
                EstadoSolucion = EstadoSolucion.Abierta
            };
            _context.Incidencias.Add(incidencia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = incidencia.Id }, ToDto(incidencia));
        }

        //Operación adicional: transición de estado, separada del update general
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, IncidenciaEstadoDto dto)
        {
            var incidencia = await _context.Incidencias.FindAsync(id);
            if (incidencia is null) return NotFound();

            if (!Enum.TryParse<EstadoSolucion>(dto.EstadoSolucion, out var estado))
                return BadRequest($"Estado inválido. Valores permitidos: {string.Join(", ", Enum.GetNames<EstadoSolucion>())}");

            incidencia.EstadoSolucion = estado;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
