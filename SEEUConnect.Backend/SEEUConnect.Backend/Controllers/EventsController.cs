using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SEEUConnect.Backend.Models;
using SEEUConnect.Backend.Services;

namespace SEEUConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        // NOW: Controller depends on Service (not Repository)
        private readonly IEventService _service;

        public EventsController(IEventService service)
        {
            _service = service;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            var events = await _service.GetAllEventsAsync();
            return Ok(events);
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var @event = await _service.GetEventByIdAsync(id);
            if (@event == null)
            {
                return NotFound();
            }
            return Ok(@event);
        }

        // POST: api/Events - Only logged-in users can create events
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event @event)
        {
            try
            {
                var created = await _service.CreateEventAsync(@event);
                return CreatedAtAction(nameof(GetEvent), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                // Service threw a validation error - return 400 Bad Request
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Events/5 - Only logged-in users can update events
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, Event @event)
        {
            var updated = await _service.UpdateEventAsync(id, @event);
            if (updated == null)
            {
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/Events/5 - Only Admins can delete events
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var deleted = await _service.DeleteEventAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }

        // GET: api/Events/category/Workshop    ← NEW endpoint!
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Event>>> GetEventsByCategory(string category)
        {
            var events = await _service.GetEventsByCategoryAsync(category);
            return Ok(events);
        }

        // GET: api/Events/search?term=party    ← NEW endpoint!
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Event>>> SearchEvents([FromQuery] string term)
        {
            var events = await _service.SearchEventsByDateAsync(term);
            return Ok(events);
        }
    }
}
