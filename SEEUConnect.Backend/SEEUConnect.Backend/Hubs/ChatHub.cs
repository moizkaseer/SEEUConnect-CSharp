using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Models;
using System.Security.Claims;

namespace SEEUConnect.Backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        // Called when a client sends a message
        public async Task SendMessage(string content)
        {
            // Get user ID from the JWT token claims
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

            if (userIdClaim == null || username == null)
            {
                throw new HubException("You must be logged in to send messages.");
            }

            var userId = int.Parse(userIdClaim);

            // Save message to database
            var message = new ChatMessage
            {
                Content = content,
                UserId = userId,
                SentAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            // Broadcast to all connected clients
            await Clients.All.SendAsync("ReceiveMessage", new
            {
                id = message.Id,
                content = message.Content,
                sentAt = message.SentAt,
                username = username
            });
        }
    }
}
