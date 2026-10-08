using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bradson.Api.Data;
using Bradson.Api.Models;
using Bradson.Api.Dtos;

namespace Bradson.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiciosController : ControllerBase
    {
        private readonly BradsonDbContext _context;

        public ServiciosController(BradsonDbContext context) => _context = context;

        //GET: api/Servicios
        //Obtiene la lista completa de servicios (Aseo, Decoración, etc.)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServicioDto>>> GetAll()
        {
            var servicios = await _context.Servicios
                .AsNoTracking()
                .Select(s => new ServicioDto
                {
                    Id = s.Id,
                    NombreCategoria = s.NombreCategoria,
                    Descripcion = s.Descripcion,
                    TarifaBase = s.TarifaBase
                })
                .ToListAsync();

            return Ok(servicios);
        }

        //GET: api/Servicios/5
        //Obtiene un servicio específico por su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ServicioDto>> GetById(int id)
        {
            var s = await _context.Servicios.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (s is null) return NotFound();

            return Ok(new ServicioDto { Id = s.Id, NombreCategoria = s.NombreCategoria, Descripcion = s.Descripcion, TarifaBase = s.TarifaBase });
        }

        //POST: api/Servicios
        //Crea una nueva categoría o tipo de servicio
        [HttpPost]
        public async Task<ActionResult<ServicioDto>> Create(ServicioUpsertDto dto)
        {
            var servicio = new ClsServicio { NombreCategoria = dto.NombreCategoria, Descripcion = dto.Descripcion, TarifaBase = dto.TarifaBase };
            _context.Servicios.Add(servicio);
            await _context.SaveChangesAsync();

            var resultado = new ServicioDto { Id = servicio.Id, NombreCategoria = servicio.NombreCategoria, Descripcion = servicio.Descripcion, TarifaBase = servicio.TarifaBase };
            return CreatedAtAction(nameof(GetById), new { id = servicio.Id }, resultado);
        }

        //PUT: api/Servicios/5
        //Actualiza las tarifas o descripción de un servicio existente
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ServicioUpsertDto dto)
        {
            var servicio = await _context.Servicios.FindAsync(id);
            if (servicio is null) return NotFound();

            servicio.NombreCategoria = dto.NombreCategoria;
            servicio.Descripcion = dto.Descripcion;
            servicio.TarifaBase = dto.TarifaBase;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //DELETE: api/Servicios/5
        //Elimina un servicio
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var servicio = await _context.Servicios.FindAsync(id);
            if (servicio is null) return NotFound();

            _context.Servicios.Remove(servicio);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
