using Microsoft.AspNetCore.Mvc;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;
using SEEUConnect.Backend.Repositories;

namespace SEEUConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventRepository _repository;

        public EventsController(IEventRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Events
        [HttpGet]
       public async Task<ActionResult<Event>> GetEvents()
        {
            var events = await _repository.GetAllAsync();
            return Ok(events);
        }
    
       


        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var @event = await _repository.GetByIdAsync(id);
            if (@event == null)
            {
                return NotFound();
            }
            return @event;
        }

        // POST: api/Events
        [HttpPost]
       public async Task<ActionResult<Event>>PostEvent(Event @event)
        {
            var createdEvent = await _repository.CreateAsync(@event);
            return CreatedAtAction(nameof(GetEvent), new { id = createdEvent.Id }, createdEvent);
        }

        // PUT: api/Events/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, Event @event)
        {
            var update = await _repository.UpdateAsync(id, @event);
            if (update == null)            {
                return NotFound();
            }   
            return NoContent();
        }
   

        // DELETE: api/Events/5
        [HttpDelete("{id}")]
        
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }

    }
}
