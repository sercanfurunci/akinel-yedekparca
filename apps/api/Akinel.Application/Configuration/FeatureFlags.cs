namespace Akinel.Application.Configuration;

public class FeatureFlags
{
    public bool VinSearch { get; set; } = true;
    public bool StockNotifications { get; set; } = true;
    public bool Analytics { get; set; } = true;
    public bool MaintenanceMode { get; set; } = false;
}
