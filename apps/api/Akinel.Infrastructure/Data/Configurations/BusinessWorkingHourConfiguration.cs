using Akinel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akinel.Infrastructure.Data.Configurations;

public class BusinessWorkingHourConfiguration : IEntityTypeConfiguration<BusinessWorkingHour>
{
    public void Configure(EntityTypeBuilder<BusinessWorkingHour> builder)
    {
        builder.ToTable("BusinessWorkingHours");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.OpenTime).HasMaxLength(10);
        builder.Property(w => w.CloseTime).HasMaxLength(10);
    }
}
