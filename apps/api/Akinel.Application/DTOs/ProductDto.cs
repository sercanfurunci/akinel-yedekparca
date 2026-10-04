using Akinel.Domain.Enums;

namespace Akinel.Application.DTOs;

public record ProductImageDto(Guid Id, string Url, string? AltText, int SortOrder, bool IsPrimary);

public record ProductDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid BrandId,
    string BrandName,
    Guid CategoryId,
    string CategoryName,
    string? PartNumber,
    string? Sku,
    decimal Price,
    decimal? DiscountPercentage,
    decimal? SalePrice,
    string Currency,
    bool IsActive,
    StockStatus StockStatus,
    int AvailableQuantity,
    string? PrimaryImageUrl,
    IEnumerable<string> OemNumbers,
    string? Barcode = null,
    decimal? WeightKg = null,
    decimal? WidthCm = null,
    decimal? LengthCm = null,
    decimal? HeightCm = null,
    string? WarrantyInfo = null,
    IEnumerable<ProductImageDto>? Images = null
);

public record ProductListItemDto(
    Guid Id,
    string Name,
    string Slug,
    Guid BrandId,
    string BrandName,
    Guid CategoryId,
    string CategoryName,
    decimal Price,
    decimal? DiscountPercentage,
    decimal? SalePrice,
    string Currency,
    StockStatus StockStatus,
    int StockQuantity,
    string? PrimaryImageUrl
);

public record CreateProductRequest(
    string Name,
    string? Description,
    Guid BrandId,
    Guid CategoryId,
    string? PartNumber,
    string? SKU,
    decimal Price,
    decimal? DiscountPercentage = null,
    string Currency = "TRY"
);

public record UpdateProductRequest(
    string Name,
    string? Description,
    Guid BrandId,
    Guid CategoryId,
    string? PartNumber,
    string? SKU,
    decimal Price,
    decimal? DiscountPercentage,
    bool IsActive,
    string? Barcode = null,
    decimal? WeightKg = null,
    decimal? WidthCm = null,
    decimal? LengthCm = null,
    decimal? HeightCm = null,
    string? WarrantyInfo = null
);
