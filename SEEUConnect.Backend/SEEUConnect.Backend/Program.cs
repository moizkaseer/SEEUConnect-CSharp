using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Repositories;
using SEEUConnect.Backend.Services;
using SEEUConnect.Backend.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injection - Repository and Service
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventService, EventService>();

// Add SignalR for real-time chat
builder.Services.AddSignalR();

// JWT Authentication configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,                // Check who created the token
        ValidateAudience = true,              // Check who the token is for
        ValidateLifetime = true,              // Check if token is expired
        ValidateIssuerSigningKey = true,       // Verify the signature
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };

    // SignalR sends JWT token via query string (not headers), so we need to read it from there
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// CORS - allow frontend to send requests (needed for local dev; in production frontend is served from same origin)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.WithOrigins("http://localhost:8081")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // Required for SignalR
        });
});

var app = builder.Build();

// Auto-apply pending database migrations on startup (creates any new tables like ChatMessages)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // Enable HTTPS redirect in production (Azure provides SSL)
}

app.UseCors("AllowAllOrigins");

// Serve the React frontend as static files (wwwroot folder)
app.UseDefaultFiles();     // Serves index.html by default
app.UseStaticFiles();      // Serves CSS, JS, images from wwwroot

// IMPORTANT: Authentication MUST come before Authorization!
app.UseAuthentication();   // "Who are you?" (reads the JWT token)
app.UseAuthorization();    // "Are you allowed?" (checks roles/policies)

app.MapControllers();

// Map SignalR hub for real-time chat
app.MapHub<ChatHub>("/chathub");

// SPA fallback: any route not matching an API endpoint or static file serves index.html
app.MapFallbackToFile("index.html");

app.Run();
