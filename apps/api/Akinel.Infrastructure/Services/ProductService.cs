using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AkinelDbContext _context;

    public ProductService(AkinelDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductListItemDto>> GetProductsAsync(ProductSearchQuery query, CancellationToken ct = default)
    {
        var q = _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Stock)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (query.InStockOnly)
            q = q.Where(p => p.Stock == null || (p.Stock.Quantity - p.Stock.ReservedQuantity) > 0);

        if (query.CategoryId.HasValue)
            q = q.Where(p => p.CategoryId == query.CategoryId.Value);

        if (query.BrandId.HasValue)
            q = q.Where(p => p.BrandId == query.BrandId.Value);

        if (!string.IsNullOrWhiteSpace(query.Query))
            q = q.Where(p => EF.Functions.ILike(p.Name, $"%{query.Query}%") ||
                              EF.Functions.ILike(p.PartNumber ?? "", $"%{query.Query}%"));

        if (query.VehicleEngineId.HasValue)
            q = q.Where(p => p.VehicleCompatibilities.Any(vc => vc.VehicleEngineId == query.VehicleEngineId.Value));

        if (query.MinPrice.HasValue) q = q.Where(p => p.Price >= query.MinPrice.Value);
        if (query.MaxPrice.HasValue) q = q.Where(p => p.Price <= query.MaxPrice.Value);

        q = query.SortBy switch
        {
            "price" => query.SortDescending ? q.OrderByDescending(p => p.Price) : q.OrderBy(p => p.Price),
            "name" => query.SortDescending ? q.OrderByDescending(p => p.Name) : q.OrderBy(p => p.Name),
            _ => q.OrderByDescending(p => p.CreatedAt)
        };

        var total = await q.CountAsync(ct);
        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PaginatedResult<ProductListItemDto>(
            items.Select(MapToListItem),
            total,
            query.Page,
            query.PageSize
        );
    }

    public async Task<ProductDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Stock)
            .Include(p => p.OemNumbers).ThenInclude(po => po.OemNumber)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive, ct);

        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Stock)
            .Include(p => p.OemNumbers).ThenInclude(po => po.OemNumber)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var baseSlug = GenerateSlug(request.Name);
        var slug = await UniqueSlugAsync(baseSlug, excludeId: null, ct);

        var product = new Product
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            BrandId = request.BrandId,
            CategoryId = request.CategoryId,
            PartNumber = request.PartNumber,
            SKU = request.SKU,
            Price = request.Price,
            DiscountPercentage = NormalizeDiscount(request.DiscountPercentage),
            Currency = request.Currency,
        };

        product.Stock = new Stock { ProductId = product.Id, Quantity = 0 };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(product.Id, ct))!;
    }

    public async Task<ProductDto?> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, ct);
        if (product == null) return null;

        var baseSlug = GenerateSlug(request.Name);
        product.Slug = await UniqueSlugAsync(baseSlug, excludeId: id, ct);
        product.Name = request.Name;
        product.Description = request.Description;
        product.BrandId = request.BrandId;
        product.CategoryId = request.CategoryId;
        product.PartNumber = request.PartNumber;
        product.SKU = request.SKU;
        product.Price = request.Price;
        product.DiscountPercentage = NormalizeDiscount(request.DiscountPercentage);
        product.IsActive = request.IsActive;
        product.Barcode = request.Barcode;
        product.WeightKg = request.WeightKg;
        product.WidthCm = request.WidthCm;
        product.LengthCm = request.LengthCm;
        product.HeightCm = request.HeightCm;
        product.WarrantyInfo = request.WarrantyInfo;

        await _context.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, ct);
        if (product == null) return false;
        product.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IEnumerable<ProductListItemDto>> GetByVehicleAsync(Guid engineId, int page = 1, int pageSize = 24, CancellationToken ct = default)
    {
        return await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Stock)
            .Where(p => p.IsActive && p.VehicleCompatibilities.Any(vc => vc.VehicleEngineId == engineId))
            .Where(p => p.Stock == null || (p.Stock.Quantity - p.Stock.ReservedQuantity) > 0)
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToListItem(p))
            .ToListAsync(ct);
    }

    // Effective discount: use stored DiscountPercentage; fall back to legacy CompareAtPrice for products
    // that predate this field.
    private static decimal? EffectiveDiscount(Product p)
    {
        if (p.DiscountPercentage.HasValue && p.DiscountPercentage.Value > 0)
            return p.DiscountPercentage.Value;
        if (p.CompareAtPrice.HasValue && p.CompareAtPrice > p.Price && p.Price > 0)
            return Math.Round((1 - p.Price / p.CompareAtPrice.Value) * 100, 2);
        return null;
    }

    private static decimal? CalcSalePrice(decimal price, decimal? discountPct)
    {
        if (!discountPct.HasValue || discountPct.Value <= 0 || price <= 0) return null;
        if (discountPct.Value >= 100) return null;
        return Math.Round(price * (1 - discountPct.Value / 100m), 2);
    }

    private static decimal? NormalizeDiscount(decimal? dp) =>
        dp.HasValue && dp.Value > 0 ? dp : null;

    private static ProductListItemDto MapToListItem(Product p)
    {
        var dp = EffectiveDiscount(p);
        return new(
            p.Id, p.Name, p.Slug, p.BrandId, p.Brand.Name, p.CategoryId, p.Category.Name,
            p.Price, dp, CalcSalePrice(p.Price, dp), p.Currency,
            p.Stock?.Status ?? StockStatus.OutOfStock,
            p.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? p.Images.FirstOrDefault()?.Url
        );
    }

    private static ProductDto MapToDto(Product p)
    {
        var dp = EffectiveDiscount(p);
        return new(
            p.Id, p.Name, p.Slug, p.Description,
            p.BrandId, p.Brand.Name, p.CategoryId, p.Category.Name,
            p.PartNumber, p.SKU, p.Price, dp, CalcSalePrice(p.Price, dp),
            p.Currency, p.IsActive,
            p.Stock?.Status ?? StockStatus.OutOfStock,
            p.Stock?.AvailableQuantity ?? 0,
            p.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? p.Images.FirstOrDefault()?.Url,
            p.OemNumbers.Select(po => po.OemNumber.Number),
            p.Barcode, p.WeightKg, p.WidthCm, p.LengthCm, p.HeightCm, p.WarrantyInfo
        );
    }

    private async Task<string> UniqueSlugAsync(string baseSlug, Guid? excludeId, CancellationToken ct)
    {
        var slug = baseSlug;
        var counter = 1;
        while (await _context.Products.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), ct))
            slug = $"{baseSlug}-{counter++}";
        return slug;
    }

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
