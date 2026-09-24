using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.HasKey(s => s.Id);
        builder.HasOne(s => s.Product).WithOne(p => p.Stock).HasForeignKey<Stock>(s => s.ProductId);
        builder.Ignore(s => s.Status);
        builder.Ignore(s => s.AvailableQuantity);
    }
}
