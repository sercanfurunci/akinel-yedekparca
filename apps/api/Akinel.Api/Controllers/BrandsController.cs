using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public BrandsController(AkinelDbContext db) => _db = db;

    [HttpGet]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetBrands(CancellationToken ct)
    {
        var brands = await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new {
                b.Id, b.Name, b.Slug, b.LogoUrl,
                ProductCount = b.Products.Count(p => p.IsActive)
            })
            .ToListAsync(ct);

        return Ok(brands);
    }

    [HttpGet("{slug}")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "*" })]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var brand = await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive && b.Slug == slug)
            .Select(b => new { b.Id, b.Name, b.Slug, b.LogoUrl })
            .FirstOrDefaultAsync(ct);

        return brand == null ? NotFound() : Ok(brand);
    }
}
