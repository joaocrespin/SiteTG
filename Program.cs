var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.MapControllers();

app.MapGet("/api/config/supabase", (IConfiguration config) =>
{
    var url = config["Supabase:Url"];
    var key = config["Supabase:AnonKey"];

    if (string.IsNullOrWhiteSpace(url) || string.IsNullOrWhiteSpace(key))
    {
        return Results.NotFound();
    }

    return Results.Ok(new { url, key });
});

app.Run();