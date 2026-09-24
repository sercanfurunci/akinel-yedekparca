using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class BusinessSettingsConfiguration : IEntityTypeConfiguration<BusinessSettings>
{
    public void Configure(EntityTypeBuilder<BusinessSettings> builder)
    {
        builder.ToTable("BusinessSettings");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.CompanyName).HasMaxLength(200).IsRequired();
        builder.Property(b => b.ShortDescription).HasMaxLength(500);
        builder.Property(b => b.Description).HasMaxLength(2000);
        builder.Property(b => b.Phone).HasMaxLength(30);
        builder.Property(b => b.WhatsApp).HasMaxLength(30);
        builder.Property(b => b.Email).HasMaxLength(200);
        builder.Property(b => b.Address).HasMaxLength(500);
        builder.Property(b => b.District).HasMaxLength(100);
        builder.Property(b => b.City).HasMaxLength(100);
        builder.Property(b => b.Country).HasMaxLength(100);
        builder.Property(b => b.PostalCode).HasMaxLength(20);
        builder.Property(b => b.GoogleMapsUrl).HasMaxLength(1000);
        builder.Property(b => b.GoogleMapsEmbedUrl).HasMaxLength(1000);
        builder.Property(b => b.WebsiteUrl).HasMaxLength(500);
        builder.Property(b => b.InstagramUrl).HasMaxLength(500);
        builder.Property(b => b.FacebookUrl).HasMaxLength(500);
        builder.Property(b => b.LinkedInUrl).HasMaxLength(500);
        builder.Property(b => b.LogoUrl).HasMaxLength(1000);
        builder.Property(b => b.FaviconUrl).HasMaxLength(1000);

        builder.HasMany(b => b.WorkingHours)
            .WithOne(w => w.BusinessSettings)
            .HasForeignKey(w => w.BusinessSettingsId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
