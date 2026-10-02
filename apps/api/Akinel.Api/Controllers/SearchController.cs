using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public SearchController(AkinelDbContext db)
    {
        _db = db;
    }

    [HttpGet("suggest")]
    public async Task<IActionResult> Suggest([FromQuery] string q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new { products = Array.Empty<object>(), brands = Array.Empty<object>(), categories = Array.Empty<object>() });

        var safe = q.Trim().Length > 100 ? q.Trim()[..100] : q.Trim();
        safe = safe.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
        var pattern = $"%{safe}%";

        var products = await _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && EF.Functions.ILike(p.Name, pattern, "\\"))
            .OrderByDescending(p => p.CreatedAt)
            .Take(4)
            .Select(p => new { p.Name, p.Slug, BrandName = p.Brand.Name })
            .ToListAsync(ct);

        var brands = await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive && EF.Functions.ILike(b.Name, pattern, "\\"))
            .Take(3)
            .Select(b => new { b.Name, b.Slug })
            .ToListAsync(ct);

        var categories = await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive && EF.Functions.ILike(c.Name, pattern, "\\"))
            .OrderBy(c => c.SortOrder)
            .Take(3)
            .Select(c => new { c.Name, c.Slug })
            .ToListAsync(ct);

        return Ok(new { products, brands, categories });
    }
}
