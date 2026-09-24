using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IOrderService _orderService;
    private readonly AkinelDbContext _db;

    public AdminController(IProductService productService, IOrderService orderService, AkinelDbContext db)
    {
        _productService = productService;
        _orderService = orderService;
        _db = db;
    }

    // ── Orders ───────────────────────────────────────────────────────

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var orders = await _orderService.GetAllOrdersAsync(page, pageSize, ct);
        var total = await _db.Orders.CountAsync(ct);
        return Ok(new { items = orders, totalCount = total, page, pageSize });
    }

    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
    {
        var order = await _orderService.GetOrderByIdAsync(id, null, isAdmin: true, ct);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpPut("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, request.Status, ct);
            return order == null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Products ────────────────────────────────────────────────────

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] ProductSearchQuery filter, CancellationToken ct)
    {
        filter.InStockOnly = false;
        return Ok(await _productService.GetProductsAsync(filter, ct));
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        if (request.DiscountPercentage.HasValue && (request.DiscountPercentage < 0 || request.DiscountPercentage >= 100))
            return BadRequest(new { message = "İndirim oranı 0 ile 99,99 arasında olmalıdır." });
        return Ok(await _productService.CreateAsync(request, ct));
    }

    [HttpPut("products/{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        if (request.DiscountPercentage.HasValue && (request.DiscountPercentage < 0 || request.DiscountPercentage >= 100))
            return BadRequest(new { message = "İndirim oranı 0 ile 99,99 arasında olmalıdır." });
        var result = await _productService.UpdateAsync(id, request, ct);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("products/{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken ct)
    {
        var success = await _productService.DeleteAsync(id, ct);
        return success ? NoContent() : NotFound();
    }

    [HttpGet("products/{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id, CancellationToken ct)
    {
        var result = await _productService.GetByIdAsync(id, ct);
        return result == null ? NotFound() : Ok(result);
    }

    // ── Product OEM ──────────────────────────────────────────────────

    [HttpGet("products/{id:guid}/oem")]
    public async Task<IActionResult> GetProductOem(Guid id, CancellationToken ct)
    {
        var items = await _db.ProductOemNumbers
            .Include(po => po.OemNumber)
            .Where(po => po.ProductId == id)
            .Select(po => new { po.OemNumber.Id, po.OemNumber.Number, po.OemNumber.Manufacturer })
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("products/{id:guid}/oem")]
    public async Task<IActionResult> AddProductOem(Guid id, [FromBody] AddOemRequest request, CancellationToken ct)
    {
        var product = await _db.Products.FindAsync(new object[] { id }, ct);
        if (product == null) return NotFound();

        var normalized = Regex.Replace(request.Number.ToUpperInvariant().Replace(" ", "").Replace("-", ""), @"[^A-Z0-9]", "");

        var oem = await _db.OemNumbers.FirstOrDefaultAsync(o => o.NormalizedNumber == normalized, ct);
        if (oem == null)
        {
            oem = new OemNumber { Number = request.Number.Trim(), NormalizedNumber = normalized, Manufacturer = request.Manufacturer };
            _db.OemNumbers.Add(oem);
        }

        var exists = await _db.ProductOemNumbers.AnyAsync(po => po.ProductId == id && po.OemNumberId == oem.Id, ct);
        if (!exists)
        {
            _db.ProductOemNumbers.Add(new ProductOemNumber { ProductId = id, OemNumberId = oem.Id });
            await _db.SaveChangesAsync(ct);
        }

        return Ok(new { oem.Id, oem.Number, oem.Manufacturer });
    }

    [HttpDelete("products/{id:guid}/oem/{oemId:guid}")]
    public async Task<IActionResult> RemoveProductOem(Guid id, Guid oemId, CancellationToken ct)
    {
        var link = await _db.ProductOemNumbers.FirstOrDefaultAsync(po => po.ProductId == id && po.OemNumberId == oemId, ct);
        if (link == null) return NotFound();
        _db.ProductOemNumbers.Remove(link);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Product Compatibility ────────────────────────────────────────

    [HttpGet("products/{id:guid}/compatibility")]
    public async Task<IActionResult> GetProductCompatibility(Guid id, CancellationToken ct)
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

    [HttpPost("products/{id:guid}/compatibility")]
    public async Task<IActionResult> AddProductCompatibility(Guid id, [FromBody] AddCompatibilityRequest request, CancellationToken ct)
    {
        var product = await _db.Products.FindAsync(new object[] { id }, ct);
        if (product == null) return NotFound();

        var exists = await _db.ProductVehicleCompatibilities.AnyAsync(vc => vc.ProductId == id && vc.VehicleEngineId == request.VehicleEngineId, ct);
        if (exists) return Conflict(new { message = "Bu araç zaten eklenmiş." });

        _db.ProductVehicleCompatibilities.Add(new ProductVehicleCompatibility
        {
            ProductId = id,
            VehicleEngineId = request.VehicleEngineId,
            Notes = request.Notes,
        });
        await _db.SaveChangesAsync(ct);

        var engine = await _db.VehicleEngines
            .Include(e => e.VehicleGeneration).ThenInclude(g => g.VehicleModel).ThenInclude(m => m.VehicleMake)
            .FirstOrDefaultAsync(e => e.Id == request.VehicleEngineId, ct);

        return Ok(new
        {
            engineId = request.VehicleEngineId,
            notes = request.Notes,
            displayLabel = engine == null ? "" :
                engine.VehicleGeneration.VehicleModel.VehicleMake.Name + " " +
                engine.VehicleGeneration.VehicleModel.Name + " " +
                engine.VehicleGeneration.Name + " " +
                engine.Name
        });
    }

    [HttpDelete("products/{id:guid}/compatibility/{engineId:guid}")]
    public async Task<IActionResult> RemoveProductCompatibility(Guid id, Guid engineId, CancellationToken ct)
    {
        var link = await _db.ProductVehicleCompatibilities.FirstOrDefaultAsync(vc => vc.ProductId == id && vc.VehicleEngineId == engineId, ct);
        if (link == null) return NotFound();
        _db.ProductVehicleCompatibilities.Remove(link);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Product Images ───────────────────────────────────────────────

    [HttpGet("products/{id:guid}/images")]
    public async Task<IActionResult> GetProductImages(Guid id, CancellationToken ct)
    {
        var images = await _db.ProductImages
            .Where(i => i.ProductId == id)
            .OrderBy(i => i.SortOrder)
            .Select(i => new { i.Id, i.Url, i.AltText, i.SortOrder, i.IsPrimary })
            .ToListAsync(ct);
        return Ok(images);
    }

    [HttpPost("products/{id:guid}/images")]
    public async Task<IActionResult> UploadProductImage(Guid id, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0) return BadRequest("Dosya gerekli.");

        var product = await _db.Products.FindAsync(new object[] { id }, ct);
        if (product == null) return NotFound();

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp")) return BadRequest("Sadece jpg, png veya webp dosyaları desteklenmektedir.");

        var uploadsDir = Path.Combine("wwwroot", "uploads", "products");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream, ct);

        var isPrimary = !await _db.ProductImages.AnyAsync(i => i.ProductId == id, ct);
        var image = new ProductImage
        {
            ProductId = id,
            Url = $"/uploads/products/{fileName}",
            AltText = file.FileName,
            SortOrder = await _db.ProductImages.CountAsync(i => i.ProductId == id, ct),
            IsPrimary = isPrimary,
        };
        _db.ProductImages.Add(image);
        await _db.SaveChangesAsync(ct);

        return Ok(new { image.Id, image.Url, image.AltText, image.SortOrder, image.IsPrimary });
    }

    [HttpPut("products/{id:guid}/images/{imageId:guid}/primary")]
    public async Task<IActionResult> SetPrimaryImage(Guid id, Guid imageId, CancellationToken ct)
    {
        var images = await _db.ProductImages.Where(i => i.ProductId == id).ToListAsync(ct);
        foreach (var img in images) img.IsPrimary = img.Id == imageId;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("products/{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteProductImage(Guid id, Guid imageId, CancellationToken ct)
    {
        var image = await _db.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == id, ct);
        if (image == null) return NotFound();

        var filePath = Path.Combine("wwwroot", image.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync(ct);

        if (image.IsPrimary)
        {
            var next = await _db.ProductImages.OrderBy(i => i.SortOrder).FirstOrDefaultAsync(i => i.ProductId == id, ct);
            if (next != null) { next.IsPrimary = true; await _db.SaveChangesAsync(ct); }
        }

        return NoContent();
    }

    // ── Brands ──────────────────────────────────────────────────────

    [HttpGet("brands")]
    public async Task<IActionResult> GetBrands(CancellationToken ct)
    {
        var brands = await _db.Brands
            .OrderBy(b => b.Name)
            .Select(b => new { b.Id, b.Name, b.Slug, b.LogoUrl, b.IsActive })
            .ToListAsync(ct);
        return Ok(brands);
    }

    [HttpPost("brands")]
    public async Task<IActionResult> CreateBrand([FromBody] CreateBrandRequest request, CancellationToken ct)
    {
        var brand = new Brand
        {
            Name = request.Name,
            Slug = GenerateSlug(request.Name),
            LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl,
        };
        _db.Brands.Add(brand);
        await _db.SaveChangesAsync(ct);
        return Ok(new { brand.Id, brand.Name, brand.Slug, brand.LogoUrl, brand.IsActive });
    }

    [HttpPut("brands/{id:guid}")]
    public async Task<IActionResult> UpdateBrand(Guid id, [FromBody] UpdateBrandRequest request, CancellationToken ct)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (brand == null) return NotFound();
        brand.Name = request.Name;
        brand.Slug = GenerateSlug(request.Name);
        brand.LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl;
        brand.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);
        return Ok(new { brand.Id, brand.Name, brand.Slug, brand.LogoUrl, brand.IsActive });
    }

    [HttpDelete("brands/{id:guid}")]
    public async Task<IActionResult> DeleteBrand(Guid id, CancellationToken ct)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (brand == null) return NotFound();
        brand.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Categories ──────────────────────────────────────────────────

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var categories = await _db.Categories
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.Slug, c.ParentCategoryId, c.IsActive, c.SortOrder })
            .ToListAsync(ct);
        return Ok(categories);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        var category = new Category
        {
            Name = request.Name,
            Slug = GenerateSlug(request.Name),
            ParentCategoryId = request.ParentCategoryId,
            SortOrder = request.SortOrder,
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);
        return Ok(new { category.Id, category.Name, category.Slug, category.ParentCategoryId, category.IsActive, category.SortOrder });
    }

    [HttpPut("categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (category == null) return NotFound();
        category.Name = request.Name;
        category.Slug = GenerateSlug(request.Name);
        category.ParentCategoryId = request.ParentCategoryId;
        category.IsActive = request.IsActive;
        category.SortOrder = request.SortOrder;
        await _db.SaveChangesAsync(ct);
        return Ok(new { category.Id, category.Name, category.Slug, category.ParentCategoryId, category.IsActive, category.SortOrder });
    }

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (category == null) return NotFound();
        category.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Stock ────────────────────────────────────────────────────────

    [HttpPut("stock/{productId:guid}")]
    public async Task<IActionResult> UpdateStock(Guid productId, [FromBody] UpdateStockRequest request, CancellationToken ct)
    {
        var stock = await _db.Stocks.FirstOrDefaultAsync(s => s.ProductId == productId, ct);
        if (stock == null) return NotFound();
        stock.Quantity = request.Quantity;
        stock.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Ok(new { stock.ProductId, stock.Quantity, stock.AvailableQuantity, Status = stock.Status.ToString() });
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Replace(" ", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-{2,}", "-");
        return slug.Trim('-');
    }
}

public record CreateBrandRequest(string Name, string? LogoUrl);
public record UpdateBrandRequest(string Name, string? LogoUrl, bool IsActive);
public record CreateCategoryRequest(string Name, Guid? ParentCategoryId, int SortOrder = 0);
public record UpdateCategoryRequest(string Name, Guid? ParentCategoryId, bool IsActive, int SortOrder = 0);
public record UpdateStockRequest(int Quantity);
public record AddOemRequest(string Number, string? Manufacturer);
public record AddCompatibilityRequest(Guid VehicleEngineId, string? Notes);
