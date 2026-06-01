using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public GameController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet("download")]
    public IActionResult Download()
    {
        var filePath = Path.Combine(_env.WebRootPath, "downloads", "Estimulo_Cognitivo_com_Elementos_de_RPG.zip");

        if (!System.IO.File.Exists(filePath))
            return NotFound("Arquivo não encontrado.");

        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, "application/zip", "Estimulo_Cognitivo_com_Elementos_de_RPG.zip");
    }

    [HttpGet("config/supabase")]
    public IActionResult SupabaseConfig()
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
            return NotFound("Config não encontrada");

        return Ok(new { url, key });
    }
}