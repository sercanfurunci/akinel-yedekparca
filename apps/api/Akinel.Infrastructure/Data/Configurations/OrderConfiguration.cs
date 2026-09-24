using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
        builder.Property(o => o.CustomerName).IsRequired().HasMaxLength(100);
        builder.Property(o => o.CustomerEmail).IsRequired().HasMaxLength(200);
        builder.Property(o => o.CustomerPhone).IsRequired().HasMaxLength(20);
        builder.Property(o => o.ShippingAddress).IsRequired().HasMaxLength(300);
        builder.Property(o => o.ShippingCity).IsRequired().HasMaxLength(100);
        builder.Property(o => o.ShippingDistrict).IsRequired().HasMaxLength(100);
        builder.Property(o => o.ShippingPostalCode).HasMaxLength(10);
        builder.Property(o => o.ShippingNotes).HasMaxLength(500);

        builder.Property(o => o.SubTotal).HasPrecision(18, 2);
        builder.Property(o => o.ShippingCost).HasPrecision(18, 2);
        builder.Property(o => o.TotalAmount).HasPrecision(18, 2);

        builder.HasMany(o => o.Items)
               .WithOne(i => i.Order)
               .HasForeignKey(i => i.OrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
