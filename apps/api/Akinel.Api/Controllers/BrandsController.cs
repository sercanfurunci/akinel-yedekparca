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
    public async Task<IActionResult> GetBrands(CancellationToken ct)
    {
        var brands = await _db.Brands
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new { b.Id, b.Name, b.Slug, b.LogoUrl })
            .ToListAsync(ct);

        return Ok(brands);
    }
}
