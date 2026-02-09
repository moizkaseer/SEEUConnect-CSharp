using Microsoft.EntityFrameworkCore  ; // we need this to use DbContext and DbSet
using SEEUConnect.Backend.Models; // we need this to use the Event model

namespace SEEUConnect.Backend.Data
{ 
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        //Each Dbset = one table in the database 
        public DbSet<Tag> Tags { get; set; } // this will create a table named Tags in the database
        public DbSet<User> Users { get; set; } // this will create a table named Users in the database
        public DbSet<Comment> Comments { get; set; } // this will create a table named Comments in the database
        public DbSet<EventTag> EventTags { get; set; } // this will create a table named EventTags in the database
        public DbSet<Event> Events { get; set; } // this will create a table named Events in the database
        public DbSet<ChatMessage> ChatMessages { get; set; } // this will create a table named ChatMessages in the database

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure composite primary key for EventTag
            modelBuilder.Entity<EventTag>()
                .HasKey(et => new { et.EventId, et.TagId });

            // Configure relationships
            modelBuilder.Entity<EventTag>()
                .HasOne(et => et.Event)
                .WithMany(e => e.EventTags)
                .HasForeignKey(et => et.EventId);

            modelBuilder.Entity<EventTag>()
                .HasOne(et => et.Tag)
                .WithMany(t => t.EventTags)
                .HasForeignKey(et => et.TagId);
        }
    }
}

