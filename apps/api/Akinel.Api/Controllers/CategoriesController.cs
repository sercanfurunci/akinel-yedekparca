using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public CategoriesController(AkinelDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var categories = await _db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.Slug, c.ParentCategoryId, c.ImageUrl })
            .ToListAsync(ct);

        return Ok(categories);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var category = await _db.Categories
            .Where(c => c.IsActive && c.Slug == slug)
            .Select(c => new { c.Id, c.Name, c.Slug, c.ParentCategoryId, c.ImageUrl })
            .FirstOrDefaultAsync(ct);

        return category == null ? NotFound() : Ok(category);
    }
}
