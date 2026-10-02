using Akinel.Application.Configuration;
using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Microsoft.Extensions.Options;

namespace Akinel.Infrastructure.Services;

public class FeatureFlagService : IFeatureFlagService
{
    private readonly FeatureFlags _flags;

    public FeatureFlagService(IOptions<FeatureFlags> options)
    {
        _flags = options.Value;
    }

    public bool IsEnabled(string flagName) => flagName switch
    {
        nameof(FeatureFlags.VinSearch) => _flags.VinSearch,
        nameof(FeatureFlags.StockNotifications) => _flags.StockNotifications,
        nameof(FeatureFlags.Analytics) => _flags.Analytics,
        nameof(FeatureFlags.MaintenanceMode) => _flags.MaintenanceMode,
        _ => false
    };

    public FeatureFlagsDto GetAll() => new(
        _flags.VinSearch,
        _flags.StockNotifications,
        _flags.Analytics,
        _flags.MaintenanceMode
    );
}
