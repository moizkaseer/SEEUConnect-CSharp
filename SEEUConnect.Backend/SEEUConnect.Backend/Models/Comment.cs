using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEEUConnect.Backend.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Foreign Key - which event this comment belongs to
        [ForeignKey("Event")]
        public int EventId { get; set; }

        // Foreign Key - which user wrote this comment
        [ForeignKey("User")]
        public int UserId { get; set; }

        // Navigation properties - lets you access the full Event/User objects
        public Event? Event { get; set; }
        public User? User { get; set; }
    }
}
