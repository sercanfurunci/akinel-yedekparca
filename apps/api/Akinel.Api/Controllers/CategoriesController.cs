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
            .Select(c => new { c.Id, c.Name, c.Slug, c.ParentCategoryId })
            .ToListAsync(ct);

        return Ok(categories);
    }
}
