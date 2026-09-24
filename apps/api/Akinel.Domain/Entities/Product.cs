using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string? PartNumber { get; set; }
    public string? SKU { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool IsActive { get; set; } = true;

    // Optional extra fields
    public string? Barcode { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? WidthCm { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? HeightCm { get; set; }
    public string? WarrantyInfo { get; set; }

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductOemNumber> OemNumbers { get; set; } = new List<ProductOemNumber>();
    public ICollection<ProductVehicleCompatibility> VehicleCompatibilities { get; set; } = new List<ProductVehicleCompatibility>();
    public Stock? Stock { get; set; }
}
