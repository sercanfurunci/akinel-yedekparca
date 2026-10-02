using Akinel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/admin/analytics")]
[Authorize(Roles = "Admin")]
public class AdminAnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analytics;

    public AdminAnalyticsController(IAnalyticsService analytics)
    {
        _analytics = analytics;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnalytics(
        [FromQuery] string period = "7d",
        CancellationToken ct = default)
    {
        var allowed = new[] { "today", "7d", "30d" };
        if (!allowed.Contains(period))
            return BadRequest(new { message = "period must be one of: today, 7d, 30d" });

        var result = await _analytics.GetAnalyticsAsync(period, ct);
        return Ok(result);
    }
}
