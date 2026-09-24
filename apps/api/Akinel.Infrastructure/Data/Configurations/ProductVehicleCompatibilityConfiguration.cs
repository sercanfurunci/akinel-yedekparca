using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class ProductVehicleCompatibilityConfiguration : IEntityTypeConfiguration<ProductVehicleCompatibility>
{
    public void Configure(EntityTypeBuilder<ProductVehicleCompatibility> builder)
    {
        builder.HasKey(p => new { p.ProductId, p.VehicleEngineId });
        builder.HasOne(p => p.Product).WithMany(pr => pr.VehicleCompatibilities).HasForeignKey(p => p.ProductId);
        builder.HasOne(p => p.VehicleEngine).WithMany(v => v.ProductCompatibilities).HasForeignKey(p => p.VehicleEngineId);
        builder.HasIndex(p => p.VehicleEngineId);
    }
}
