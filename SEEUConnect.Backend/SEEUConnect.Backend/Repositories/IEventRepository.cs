using SEEUConnect.Backend.Models;

namespace SEEUConnect.Backend.Repositories
{
    // This INTERFACE defines WHAT operations are available
    // It's like a menu - it lists what you CAN do, but not HOW it's done
    public interface IEventRepository
    {
        Task<IEnumerable<Event>> GetAllAsync();           // Get all events
        Task<Event?> GetByIdAsync(int id);                // Get one event (nullable - might not exist)
        Task<Event> CreateAsync(Event entity);            // Create new event
        Task<Event?> UpdateAsync(int id, Event entity);   // Update event (nullable - might not exist)
        Task<bool> DeleteAsync(int id);                   // Delete event (returns true/false)
    }
}
