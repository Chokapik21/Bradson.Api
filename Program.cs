using Microsoft.EntityFrameworkCore;
using Bradson.Api.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

//Add services to the container.
builder.Services.AddControllers()
     .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

//Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<BradsonDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("BradsonDB")));

var app = builder.Build();

// Configure the HTTP request pipeline.

app.MapOpenApi(); // Expone el documento JSON nativo en /openapi/v1.json
app.MapScalarApiReference(); // Expone la interfaz gráfica en /scalar/v1

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
