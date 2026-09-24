using Akinel.Application.Configuration;
using Akinel.Application.Contracts;
using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Akinel.Infrastructure.ExternalCatalog;
using Akinel.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Akinel.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<SessionSettings>(configuration.GetSection("SessionSettings"));
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        services.AddDbContext<AkinelDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVehicleService, VehicleService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IPartsCatalogProvider, NullPartsCatalogProvider>();
        services.AddScoped<IBusinessSettingsService, BusinessSettingsService>();

        return services;
    }
}
