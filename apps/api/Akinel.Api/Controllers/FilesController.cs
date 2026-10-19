using Akinel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Akinel.Api.Controllers;

[ApiController]
public class FilesController : ControllerBase
{
    private readonly IStorageService _storage;
    private readonly IHttpClientFactory _httpClientFactory;

    public FilesController(IStorageService storage, IHttpClientFactory httpClientFactory)
    {
        _storage = storage;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("api/files/{*key}")]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> Get(string key, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(key)) return NotFound();

        // Only allow safe path characters — reject anything outside alphanumeric, dash, underscore, dot, slash
        if (!System.Text.RegularExpressions.Regex.IsMatch(key, @"^[a-zA-Z0-9\-_./]+$"))
            return NotFound();

        // Reject path traversal regardless of encoding
        var normalized = key.Replace('\\', '/');
        if (normalized.Contains("..") || normalized.Contains('\0'))
            return NotFound();

        var b2Url = await _storage.GetPresignedUrlAsync(key, ct);
        return Redirect(b2Url);
    }
}
