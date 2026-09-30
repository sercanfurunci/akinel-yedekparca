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

        // Reject obvious path traversal attempts
        if (key.Contains("..") || key.Contains('\0')) return NotFound();

        var b2Url = await _storage.GetPresignedUrlAsync(key, ct);
        var http = _httpClientFactory.CreateClient();
        var resp = await http.GetAsync(b2Url, ct);
        if (!resp.IsSuccessStatusCode) return NotFound();

        var contentType = resp.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
        var stream = await resp.Content.ReadAsStreamAsync(ct);
        return File(stream, contentType);
    }
}
