using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Services;

public class SearchService : ISearchService
{
    private readonly AkinelDbContext _context;
    private readonly IProductService _productService;

    public SearchService(AkinelDbContext context, IProductService productService)
    {
        _context = context;
        _productService = productService;
    }

    public async Task<PaginatedResult<ProductListItemDto>> SearchAsync(ProductSearchQuery query, CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(query.Query) && query.QueryType == SearchQueryType.OemNumber)
        {
            // Normalize the same way AdminController does when saving OEM numbers
            var normalized = System.Text.RegularExpressions.Regex.Replace(
                query.Query.Trim().ToUpperInvariant().Replace(" ", "").Replace("-", ""),
                @"[^A-Z0-9]", "");
            var oemProductIds = await _context.ProductOemNumbers
                .Include(po => po.OemNumber)
                .Where(po => po.OemNumber.NormalizedNumber.Contains(normalized))
                .Select(po => po.ProductId)
                .ToListAsync(ct);

            if (oemProductIds.Any())
            {
                var q = new ProductSearchQuery(query) { Query = null };
                var products = _context.Products
                    .Include(p => p.Brand).Include(p => p.Category)
                    .Include(p => p.Images).Include(p => p.Stock)
                    .Where(p => oemProductIds.Contains(p.Id) && p.IsActive);

                var total = await products.CountAsync(ct);
                var items = await products.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
                return new PaginatedResult<ProductListItemDto>(
                    items.Select(p => MapToListItem(p)),
                    total, q.Page, q.PageSize
                );
            }
        }

        return await _productService.GetProductsAsync(query, ct);
    }

    public async Task<IEnumerable<string>> GetSuggestionsAsync(string query, int limit = 10, CancellationToken ct = default)
    {
        var productNames = await _context.Products
            .Where(p => p.IsActive && EF.Functions.ILike(p.Name, $"%{query}%"))
            .Take(limit)
            .Select(p => p.Name)
            .ToListAsync(ct);

        return productNames;
    }

    private static decimal? EffectiveDiscount(Domain.Entities.Product p)
    {
        if (p.DiscountPercentage.HasValue && p.DiscountPercentage.Value > 0)
            return p.DiscountPercentage.Value;
        if (p.CompareAtPrice.HasValue && p.CompareAtPrice > p.Price && p.Price > 0)
            return Math.Round((1 - p.Price / p.CompareAtPrice.Value) * 100, 2);
        return null;
    }

    private static decimal? CalcSalePrice(decimal price, decimal? dp) =>
        dp.HasValue && dp.Value > 0 && dp.Value < 100 && price > 0
            ? Math.Round(price * (1 - dp.Value / 100m), 2)
            : null;

    private static Application.DTOs.ProductListItemDto MapToListItem(Domain.Entities.Product p)
    {
        var dp = EffectiveDiscount(p);
        return new(
            p.Id, p.Name, p.Slug, p.BrandId, p.Brand.Name, p.CategoryId, p.Category.Name,
            p.Price, dp, CalcSalePrice(p.Price, dp), p.Currency,
            p.Stock?.Status ?? Domain.Enums.StockStatus.OutOfStock,
            p.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? p.Images.FirstOrDefault()?.Url
        );
    }
}
