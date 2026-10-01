using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class StockNotificationConfiguration : IEntityTypeConfiguration<StockNotification>
{
    public void Configure(EntityTypeBuilder<StockNotification> builder)
    {
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Email).IsRequired().HasMaxLength(320);

        // Hot path: ProductsController.NotifyStock looks up by ProductId + Email;
        // worker loops will scan by ProductId when stock becomes available.
        builder.HasIndex(n => n.ProductId);
        builder.HasIndex(n => new { n.ProductId, n.Email, n.NotifiedAt });

        builder.HasOne(n => n.Product)
            .WithMany()
            .HasForeignKey(n => n.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
