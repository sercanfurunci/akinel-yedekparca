using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ISearchService _searchService;
    private readonly AkinelDbContext _db;

    public ProductsController(IProductService productService, ISearchService searchService, AkinelDbContext db)
    {
        _productService = productService;
        _searchService = searchService;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductSearchQuery filter, CancellationToken ct)
        => Ok(await _productService.GetProductsAsync(filter, ct));

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProduct(string slug, CancellationToken ct)
    {
        var product = await _productService.GetBySlugAsync(slug, ct);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] ProductSearchQuery filter, CancellationToken ct)
        => Ok(await _searchService.SearchAsync(filter, ct));

    [HttpGet("{id:guid}/compatibility")]
    public async Task<IActionResult> GetCompatibility(Guid id, CancellationToken ct)
    {
        var items = await _db.ProductVehicleCompatibilities
            .Include(vc => vc.VehicleEngine)
                .ThenInclude(e => e.VehicleGeneration)
                    .ThenInclude(g => g.VehicleModel)
                        .ThenInclude(m => m.VehicleMake)
            .Where(vc => vc.ProductId == id)
            .Select(vc => new
            {
                engineId = vc.VehicleEngineId,
                notes = vc.Notes,
                displayLabel = vc.VehicleEngine.VehicleGeneration.VehicleModel.VehicleMake.Name + " " +
                               vc.VehicleEngine.VehicleGeneration.VehicleModel.Name + " " +
                               vc.VehicleEngine.VehicleGeneration.Name + " " +
                               vc.VehicleEngine.Name
            })
            .ToListAsync(ct);
        return Ok(items);
    }
}
