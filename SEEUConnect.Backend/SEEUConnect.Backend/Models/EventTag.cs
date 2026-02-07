using System.ComponentModel.DataAnnotations.Schema;

namespace SEEUConnect.Backend.Models
{
    // Junction table for Many-to-Many relationship between Event and Tag
    // This table just holds pairs of IDs: "Event 3 has Tag 1", "Event 3 has Tag 2"
    public class EventTag
    {
        [ForeignKey("Event")]
        public int EventId { get; set; }

        [ForeignKey("Tag")]
        public int TagId { get; set; }

        // Navigation properties
        public Event? Event { get; set; }
        public Tag? Tag { get; set; }
    }
}
