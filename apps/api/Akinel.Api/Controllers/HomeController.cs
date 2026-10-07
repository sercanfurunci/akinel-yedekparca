using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/home")]
public class HomeController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public HomeController(AkinelDbContext db)
    {
        _db = db;
    }

    [HttpGet("banners")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetBanners(CancellationToken ct)
    {
        var banners = await _db.HomepageBanners
            .AsNoTracking()
            .Where(b => b.IsActive)
            .Select(b => new { b.SectionKey, b.ImageUrl })
            .ToListAsync(ct);
        return Ok(banners);
    }
}
