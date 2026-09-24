using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class ProductOemNumberConfiguration : IEntityTypeConfiguration<ProductOemNumber>
{
    public void Configure(EntityTypeBuilder<ProductOemNumber> builder)
    {
        builder.HasKey(p => new { p.ProductId, p.OemNumberId });
        builder.HasOne(p => p.Product).WithMany(pr => pr.OemNumbers).HasForeignKey(p => p.ProductId);
        builder.HasOne(p => p.OemNumber).WithMany(o => o.Products).HasForeignKey(p => p.OemNumberId);
    }
}
