using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Data;

public class AkinelDbContext : DbContext
{
    public AkinelDbContext(DbContextOptions<AkinelDbContext> options) : base(options) { }

    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<OemNumber> OemNumbers => Set<OemNumber>();
    public DbSet<ProductOemNumber> ProductOemNumbers => Set<ProductOemNumber>();
    public DbSet<VehicleMake> VehicleMakes => Set<VehicleMake>();
    public DbSet<VehicleModel> VehicleModels => Set<VehicleModel>();
    public DbSet<VehicleGeneration> VehicleGenerations => Set<VehicleGeneration>();
    public DbSet<VehicleEngine> VehicleEngines => Set<VehicleEngine>();
    public DbSet<ProductVehicleCompatibility> ProductVehicleCompatibilities => Set<ProductVehicleCompatibility>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserVehicle> UserVehicles => Set<UserVehicle>();
    public DbSet<BusinessSettings> BusinessSettings => Set<BusinessSettings>();
    public DbSet<BusinessWorkingHour> BusinessWorkingHours => Set<BusinessWorkingHour>();
    public DbSet<BasketItem> BasketItems => Set<BasketItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AkinelDbContext).Assembly);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderNumber).IsUnique();
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.UserId);
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.CustomerEmail);
        modelBuilder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<int>();
        modelBuilder.Entity<Order>()
            .Property(o => o.PaymentMethod)
            .HasConversion<int>();

        // Basket session lookups — index prevents full table scans on every basket request
        modelBuilder.Entity<BasketItem>()
            .HasIndex(b => b.SessionId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity &&
                        (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;
            if (entry.State == EntityState.Added)
                entity.CreatedAt = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
