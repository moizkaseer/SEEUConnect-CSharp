using Microsoft.EntityFrameworkCore;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Models;

namespace SEEUConnect.Backend.Repositories
{
    // This class IMPLEMENTS the interface - it defines HOW each operation works
    // Think of it: Interface = "What can you do?"  Implementation = "Here's how I do it"
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;

        // Constructor - receives the database context via Dependency Injection
        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        // GET ALL - Returns every event from the database
        public async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _context.Events.ToListAsync();
        }

        // GET BY ID - Find a single event, returns null if not found
        public async Task<Event?> GetByIdAsync(int id)
        {
            return await _context.Events.FindAsync(id);
        }

        // CREATE - Add a new event to the database
        public async Task<Event> CreateAsync(Event entity)
        {
            _context.Events.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        // UPDATE - Modify an existing event
        public async Task<Event?> UpdateAsync(int id, Event entity)
        {
            var existing = await _context.Events.FindAsync(id);
            if (existing == null)
            {
                return null;
            }

            // Update each property with the new values
            existing.Title = entity.Title;
            existing.Description = entity.Description;
            existing.Location = entity.Location;
            existing.Category = entity.Category;
            existing.Date = entity.Date;
            existing.Tags = entity.Tags;
            existing.Votes = entity.Votes;

            await _context.SaveChangesAsync();
            return existing;
        }

        // DELETE - Remove an event, returns false if not found
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Events.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            _context.Events.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
