using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/business")]
public class BusinessController : ControllerBase
{
    private readonly IBusinessSettingsService _service;

    public BusinessController(IBusinessSettingsService service) => _service = service;

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
    {
        var settings = await _service.GetAsync(ct);
        return settings == null ? NotFound() : Ok(settings);
    }

    [HttpPut("settings")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateBusinessSettingsRequest request, CancellationToken ct)
        => Ok(await _service.UpdateAsync(request, ct));
}
