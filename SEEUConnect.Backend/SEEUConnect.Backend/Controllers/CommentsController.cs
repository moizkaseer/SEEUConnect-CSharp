using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Models;
using System.Security.Claims;

namespace SEEUConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/comments/event/5 - Get all comments for an event
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult> GetCommentsByEvent(int eventId)
        {
            var comments = await _context.Comments
                .Where(c => c.EventId == eventId)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    id = c.Id,
                    content = c.Content,
                    createdAt = c.CreatedAt,
                    username = c.User!.Username
                })
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/comments - Create a new comment (requires auth)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateComment([FromBody] CreateCommentDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            // Verify the event exists
            var eventExists = await _context.Events.AnyAsync(e => e.Id == dto.EventId);
            if (!eventExists)
                return NotFound("Event not found");

            var comment = new Comment
            {
                Content = dto.Content,
                EventId = dto.EventId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = comment.Id,
                content = comment.Content,
                createdAt = comment.CreatedAt,
                username = username
            });
        }
    }

    public class CreateCommentDto
    {
        public string Content { get; set; } = string.Empty;
        public int EventId { get; set; }
    }
}
