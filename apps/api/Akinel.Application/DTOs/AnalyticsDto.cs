namespace Akinel.Application.DTOs;

public record DbMetricsDto(
    int TotalUsers,
    int ActiveUsers,
    int NewUsers,
    int TotalProducts,
    int ActiveProducts,
    int TotalOrders,
    int OrdersInPeriod,
    decimal RevenueInPeriod,
    decimal AverageOrderValue,
    List<OrderStatusCountDto> OrdersByStatus,
    List<TopProductDto> TopProducts,
    List<RecentOrderDto> RecentOrders
);

public record OrderStatusCountDto(string Status, int Count);

public record TopProductDto(
    string ProductId,
    string ProductName,
    string? BrandName,
    int TotalQuantity,
    int OrderCount
);

public record RecentOrderDto(
    string OrderNumber,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    string Status,
    DateTime CreatedAt
);

public record PostHogMetricsDto(
    bool Available,
    long? UniqueVisitors,
    long? ProductViews,
    long? AddToCart,
    long? CheckoutStarted,
    long? Purchases,
    List<FunnelStepDto>? Funnel,
    List<SearchTypeDto>? SearchTypeBreakdown,
    long? VinSearchSuccess,
    long? VinSearchFailed
);

public record FunnelStepDto(string Name, string Event, long Count);

public record SearchTypeDto(string Type, long Count);

public record AnalyticsResponseDto(
    string Period,
    DbMetricsDto Db,
    PostHogMetricsDto PostHog
);
