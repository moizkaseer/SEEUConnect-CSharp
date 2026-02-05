using System.ComponentModel.DataAnnotations;

namespace SEEUConnect.Backend.Models
{
    public class Event
    {
        //primay key 
        [Key]
        public int Id { get; set; }

        //basic info 
        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public string Tags { get; set; } = string.Empty;

        public int Votes { get; set; } = 0;
    }
}
