using Microsoft.AspNetCore.Mvc;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace SEEUConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _context.Events.ToListAsync();
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var @event = await _context.Events.FindAsync(id);
            if (@event == null)
            {
                return NotFound();
            }
            return @event;
        }

        // POST: api/Events
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event @event)
        {
            _context.Events.Add(@event);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEvent), new { id = @event.Id }, @event);
        }

        // PUT: api/Events/5     ← NEW!
        // PUT: api/Events/5
[HttpPut("{id}")]
public async Task<IActionResult> PutEvent(int id, Event @event)
{
    if (id != @event.Id)
    {
        return BadRequest("Event ID mismatch");
    }

    _context.Entry(@event).State = EntityState.Modified;

    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateConcurrencyException)
    {
        if (!_context.Events.Any(e => e.Id == id))
        {
            return NotFound();
        }
        throw;
    }

    return NoContent();
}



        // DELETE: api/Events/5  ← NEW!
        // DELETE: api/Events/5
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteEvent(int id)
{
    var @event = await _context.Events.FindAsync(id);
    if (@event == null)
    {
        return NotFound();
    }

    _context.Events.Remove(@event);
    await _context.SaveChangesAsync();

    return NoContent();
}

    }
}
