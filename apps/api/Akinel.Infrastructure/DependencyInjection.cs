using Akinel.Application.Configuration;
using Akinel.Application.Contracts;
using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Akinel.Infrastructure.ExternalCatalog;
using Akinel.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Resend;

namespace Akinel.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<SessionSettings>(configuration.GetSection("SessionSettings"));
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<FeatureFlags>(configuration.GetSection("Features"));
        services.Configure<ResendSettings>(configuration.GetSection("Resend"));
        services.AddSingleton<IFeatureFlagService, FeatureFlagService>();

        // Resend email
        services.AddOptions<ResendClientOptions>().Configure(o =>
        {
            o.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty;
        });
        services.AddHttpClient<ResendClient>();
        services.AddTransient<IResend, ResendClient>();
        services.AddScoped<IEmailService, EmailService>();

        var connStr = configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        if (connStr != null && connStr.StartsWith("postgresql://"))
        {
            var uri = new Uri(connStr);
            var userInfo = uri.UserInfo.Split(':');
            connStr = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
        }
        services.AddDbContext<AkinelDbContext>(options => options.UseNpgsql(connStr));

        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVehicleService, VehicleService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IPartsCatalogProvider, NullPartsCatalogProvider>();
        services.AddScoped<IBusinessSettingsService, BusinessSettingsService>();
        services.AddSingleton<IStorageService, B2StorageService>();
        services.AddHttpClient<IVinDecoder, NhtsaVinDecoder>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(10);
            client.DefaultRequestHeaders.Add("User-Agent", "Akinel/1.0");
        });

        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddHttpClient<AnalyticsService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(15);
        });

        services.AddScoped<IBulkImportService, BulkImportService>();

        return services;
    }
}
