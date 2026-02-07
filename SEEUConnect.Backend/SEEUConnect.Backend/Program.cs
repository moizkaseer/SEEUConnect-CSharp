using Microsoft.EntityFrameworkCore;
using SEEUConnect.Backend.Data;
using SEEUConnect.Backend.Repositories;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//so here we are using this to tell the app to use the sql server database with the connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//now we have to allow the frontend to send requests to this backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{   
    //https request for swagger
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Disabled: causes issues when frontend uses HTTP

app.UseCors("AllowAllOrigins");

app.UseAuthorization();

app.MapControllers();

app.Run();