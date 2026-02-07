using System.ComponentModel.DataAnnotations;

namespace SEEUConnect.Backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "User";  // "User" or "Admin"

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property - One User has Many Comments
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
