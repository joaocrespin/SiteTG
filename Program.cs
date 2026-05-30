var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.MapControllers();

app.Run();