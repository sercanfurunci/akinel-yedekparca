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

    [HttpPost("{id:guid}/notify-stock")]
    public async Task<IActionResult> NotifyStock(Guid id, [FromBody] NotifyStockRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            return BadRequest(new { message = "Geçerli bir e-posta adresi girin." });

        var product = await _db.Products
            .Include(p => p.Stock)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, ct);

        if (product == null) return NotFound();

        // Return 400 if product is in stock
        var qty = product.Stock?.Quantity - product.Stock?.ReservedQuantity ?? 0;
        if (qty > 0)
            return BadRequest(new { message = "Bu ürün şu anda stokta mevcut." });

        var email = request.Email.Trim().ToLowerInvariant();

        // Check duplicate
        var exists = await _db.StockNotifications
            .AnyAsync(n => n.ProductId == id && n.Email == email && n.NotifiedAt == null, ct);
        if (exists)
            return Ok(new { message = "Bu e-posta adresi zaten kayıtlı." });

        _db.StockNotifications.Add(new Akinel.Domain.Entities.StockNotification
        {
            ProductId = id,
            Email = email,
        });
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Stok bildirimi kaydedildi." });
    }

    [HttpGet("{slug}/related")]
    public async Task<IActionResult> GetRelated(string slug, [FromQuery] Guid? engineId, CancellationToken ct)
    {
        var product = await _db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive, ct);

        if (product == null) return NotFound();

        // Base query: same category, exclude current product, active only
        var q = _db.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Stock)
            .Where(p => p.IsActive && p.Id != product.Id && p.CategoryId == product.CategoryId)
            .AsQueryable();

        // If engineId is provided, prefer compatible products (order them first)
        List<Akinel.Domain.Entities.Product> results;
        if (engineId.HasValue)
        {
            var compatIds = await _db.ProductVehicleCompatibilities
                .Where(vc => vc.VehicleEngineId == engineId.Value)
                .Select(vc => vc.ProductId)
                .ToListAsync(ct);

            var compatible = await q
                .Where(p => compatIds.Contains(p.Id))
                .OrderByDescending(p => p.BrandId == product.BrandId)
                .ThenBy(p => p.Stock == null || (p.Stock.Quantity - p.Stock.ReservedQuantity) <= 0)
                .Take(8)
                .ToListAsync(ct);

            var remaining = 8 - compatible.Count;
            if (remaining > 0)
            {
                var compatResultIds = compatible.Select(p => p.Id).ToList();
                var others = await q
                    .Where(p => !compatIds.Contains(p.Id) && !compatResultIds.Contains(p.Id))
                    .OrderByDescending(p => p.BrandId == product.BrandId)
                    .ThenBy(p => p.Stock == null || (p.Stock.Quantity - p.Stock.ReservedQuantity) <= 0)
                    .Take(remaining)
                    .ToListAsync(ct);
                results = [.. compatible, .. others];
            }
            else
            {
                results = compatible;
            }
        }
        else
        {
            results = await q
                .OrderByDescending(p => p.BrandId == product.BrandId)
                .ThenBy(p => p.Stock == null || (p.Stock.Quantity - p.Stock.ReservedQuantity) <= 0)
                .Take(8)
                .ToListAsync(ct);
        }

        var dtos = results.Select(p =>
        {
            decimal? dp = p.DiscountPercentage.HasValue && p.DiscountPercentage.Value > 0
                ? p.DiscountPercentage.Value
                : (p.CompareAtPrice.HasValue && p.CompareAtPrice > p.Price && p.Price > 0
                    ? Math.Round((1 - p.Price / p.CompareAtPrice.Value) * 100, 2)
                    : (decimal?)null);
            decimal? salePrice = dp.HasValue && dp.Value > 0 && dp.Value < 100 && p.Price > 0
                ? Math.Round(p.Price * (1 - dp.Value / 100m), 2)
                : null;
            return new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.BrandId,
                BrandName = p.Brand.Name,
                p.CategoryId,
                CategoryName = p.Category.Name,
                p.Price,
                DiscountPercentage = dp,
                SalePrice = salePrice,
                p.Currency,
                StockStatus = p.Stock?.Status ?? Akinel.Domain.Enums.StockStatus.OutOfStock,
                PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? p.Images.FirstOrDefault()?.Url,
            };
        });

        return Ok(dtos);
    }

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

public record NotifyStockRequest(string Email);
