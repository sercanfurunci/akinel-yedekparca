using Akinel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Akinel.Api.Controllers;

[ApiController]
public class FilesController : ControllerBase
{
    private readonly IStorageService _storage;

    public FilesController(IStorageService storage) => _storage = storage;

    [HttpGet("api/files/{*key}")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    public IActionResult Get(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) return NotFound();
        var url = _storage.GetPresignedUrl(key, expiryMinutes: 60);
        return Redirect(url);
    }
}
