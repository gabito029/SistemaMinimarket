using Microsoft.EntityFrameworkCore;
using Minimarket.Domain.Entities;
using Minimarket.Infrastructure;
using Minimarket.Application.Interfaces;
using Minimarket.Infrastructure.Data;
using Minimarket.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "DB Minimarket API";
    config.Version = "v1";
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddScoped<IVentasService, VentasService>();
builder.Services.AddScoped<IInventarioService, InventarioService>();
builder.Services.AddScoped<ICajaService, CajaService>();
builder.Services.AddScoped<ICreditoService, CreditoService>();

builder.Services.AddDbContext<DbMinimarketContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(settings =>
    {
        settings.Path = "/swagger";
    });
}

app.UseCors("AllowReact");
// app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

[System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

[System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
public partial class Program { }
