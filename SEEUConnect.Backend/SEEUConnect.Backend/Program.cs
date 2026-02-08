using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Repositories;
using SEEUConnect.Backend.Services;

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
});

// CORS - allow frontend to send requests (needed for local dev; in production frontend is served from same origin)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.WithOrigins("http://localhost:8081")
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

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

// SPA fallback: any route not matching an API endpoint or static file serves index.html
app.MapFallbackToFile("index.html");

app.Run();
