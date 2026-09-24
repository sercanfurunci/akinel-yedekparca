using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class OemNumberConfiguration : IEntityTypeConfiguration<OemNumber>
{
    public void Configure(EntityTypeBuilder<OemNumber> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Number).IsRequired().HasMaxLength(100);
        builder.Property(o => o.NormalizedNumber).IsRequired().HasMaxLength(100);
        builder.HasIndex(o => o.NormalizedNumber);
        builder.Property(o => o.Manufacturer).HasMaxLength(100);
    }
}
