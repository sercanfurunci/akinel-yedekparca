using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/hero")]
public class HeroController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public HeroController(AkinelDbContext db)
    {
        _db = db;
    }

    [HttpGet("slides")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetActiveSlides(CancellationToken ct)
    {
        var slides = await _db.HomepageHeroSlides
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new { s.Id, s.ImageUrl, s.Title, s.Subtitle, s.CtaText, s.CtaUrl, s.DisplayOrder })
            .ToListAsync(ct);
        return Ok(slides);
    }
}
