using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEEUConnect.Backend.Data;

namespace SEEUConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/chat/messages?count=50
        // Returns the most recent chat messages (default: last 50)
        [HttpGet("messages")]
        [Authorize]
        public async Task<ActionResult> GetMessages([FromQuery] int count = 50)
        {
            var messages = await _context.ChatMessages
                .Include(m => m.User)
                .OrderByDescending(m => m.SentAt)
                .Take(count)
                .Select(m => new
                {
                    id = m.Id,
                    content = m.Content,
                    sentAt = m.SentAt,
                    username = m.User!.Username
                })
                .ToListAsync();

            // Return in chronological order (oldest first)
            messages.Reverse();

            return Ok(messages);
        }
    }
}
