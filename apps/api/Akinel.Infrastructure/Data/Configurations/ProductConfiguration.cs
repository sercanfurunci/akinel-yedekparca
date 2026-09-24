using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(500);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(500);
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Price).HasPrecision(18, 2);
        builder.Property(p => p.CompareAtPrice).HasPrecision(18, 2);
        builder.Property(p => p.DiscountPercentage).HasPrecision(5, 2);
        builder.Property(p => p.Currency).HasMaxLength(3).HasDefaultValue("TRY");
        builder.Property(p => p.PartNumber).HasMaxLength(100);
        builder.Property(p => p.SKU).HasMaxLength(100);
        builder.HasIndex(p => p.PartNumber);
        builder.HasIndex(p => p.SKU);
        builder.HasOne(p => p.Brand).WithMany(b => b.Products).HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.WeightKg).HasPrecision(8, 3);
        builder.Property(p => p.WidthCm).HasPrecision(8, 2);
        builder.Property(p => p.LengthCm).HasPrecision(8, 2);
        builder.Property(p => p.HeightCm).HasPrecision(8, 2);
        builder.Property(p => p.Barcode).HasMaxLength(50);
        builder.Property(p => p.WarrantyInfo).HasMaxLength(500);
    }
}
