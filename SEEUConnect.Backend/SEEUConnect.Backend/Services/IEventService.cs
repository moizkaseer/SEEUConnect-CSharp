using System.Collections;
using SEEUConnect.Backend.Models;

namespace SEEUConnect.Backend.Services
{
   //SERVICE INTERFACE  -DEFINES BUSNIESS LOGIC OPERATIONS

   public interface IEventService
    {
        Task<IEnumerable<Event>> GetAllEventsAsync();           // Get all events
        Task<Event?> GetEventByIdAsync(int id);                // Get one event (nullable - might not exist)
        Task<Event> CreateEventAsync(Event entity);            // Create new event
        Task<Event?> UpdateEventAsync(int id, Event entity);   // Update event (nullable - might not exist)
        Task<bool> DeleteEventAsync(int id);        
        Task<IEnumerable<Event>> GetEventsByCategoryAsync(string category);
        Task<IEnumerable<Event>> SearchEventsByDateAsync(string searchTerm);
    }
}