using SEEUConnect.Backend.Models;
using SEEUConnect.Backend.Repositories;

namespace SEEUConnect.Backend.Services
{
    // Service implementation - contains business logic
    // It uses the Repository for data access, but adds validation and filtering
    public class EventService : IEventService
    {
        private readonly IEventRepository _repository;

        // Constructor - receives Repository via DI
        // Notice: Service depends on Repository, NOT on DbContext directly
        public EventService(IEventRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Event>> GetAllEventsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Event?> GetEventByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        // CREATE with validation - this is BUSINESS LOGIC!
        public async Task<Event> CreateEventAsync(Event entity)
        {
            // Business rule: Title cannot be empty
            if (string.IsNullOrWhiteSpace(entity.Title))
            {
                throw new ArgumentException("Event title is required");
            }

            // Business rule: Date must be today or in the future
            if (entity.Date < DateTime.Now)
            {
                throw new ArgumentException("Event date must be in the future");
            }

            return await _repository.CreateAsync(entity);
        }

        public async Task<Event?> UpdateEventAsync(int id, Event entity)
        {
            return await _repository.UpdateAsync(id, entity);
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        // FILTER by category - Business logic!
        public async Task<IEnumerable<Event>> GetEventsByCategoryAsync(string category)
        {
            var allEvents = await _repository.GetAllAsync();
            return allEvents.Where(e => e.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        // SEARCH across multiple fields - Business logic!
        public async Task<IEnumerable<Event>> SearchEventsByDateAsync(string searchTerm)
        {
            var allEvents = await _repository.GetAllAsync();
            return allEvents.Where(e =>
                e.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                e.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                e.Location.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
            );
        }
    }
}
