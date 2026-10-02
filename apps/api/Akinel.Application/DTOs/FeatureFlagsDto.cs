namespace Akinel.Application.DTOs;

public record FeatureFlagsDto(
    bool VinSearch,
    bool StockNotifications,
    bool Analytics,
    bool MaintenanceMode
);
