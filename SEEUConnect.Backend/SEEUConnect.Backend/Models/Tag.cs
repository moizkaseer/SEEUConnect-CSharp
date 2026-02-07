using System.ComponentModel.DataAnnotations;

namespace SEEUConnect.Backend.Models
{
    public class Tag
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        // Navigation property - Many-to-Many via EventTag
        public ICollection<EventTag> EventTags { get; set; } = new List<EventTag>();
    }
}
