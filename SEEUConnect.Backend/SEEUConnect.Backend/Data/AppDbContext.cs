using Microsoft.EntityFrameworkCore  ; // we need this to use DbContext and DbSet
using SEEUConnect.Backend.Models; // we need this to use the Event model

namespace SEEUConnect.Backend.Data
{ 
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<Event> Events { get; set; } // this will create a table named Events in the database
    }
}

