using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEEUConnect.Backend.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Foreign Key - which user sent this message
        [ForeignKey("User")]
        public int UserId { get; set; }

        // Navigation property
        public User? User { get; set; }
    }
}
