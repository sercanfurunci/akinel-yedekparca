using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Akinel.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly AkinelDbContext _db;
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly string? _postHogKey;
    private readonly string _postHogProjectId;
    private readonly string _postHogHost;

    public AnalyticsService(
        AkinelDbContext db,
        HttpClient http,
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<AnalyticsService> logger)
    {
        _db = db;
        _http = http;
        _cache = cache;
        _logger = logger;
        _postHogKey = configuration["PostHog:PersonalApiKey"];
        _postHogProjectId = configuration["PostHog:ProjectId"] ?? "291663";
        _postHogHost = configuration["PostHog:Host"] ?? "https://eu.posthog.com";
    }

    public async Task<AnalyticsResponseDto> GetAnalyticsAsync(string period, CancellationToken ct)
    {
        var cacheKey = $"analytics_{period}";
        if (_cache.TryGetValue(cacheKey, out AnalyticsResponseDto? cached) && cached != null)
            return cached;

        var cutoff = period switch
        {
            "today" => DateTime.UtcNow.Date,
            "7d" => DateTime.UtcNow.AddDays(-7),
            "30d" => DateTime.UtcNow.AddDays(-30),
            _ => throw new ArgumentException($"Invalid period: {period}")
        };

        var dbMetrics = await GetDbMetricsAsync(cutoff, ct);
        var (postHogMetrics, postHogFailed) = await GetPostHogMetricsAsync(cutoff, ct);

        var result = new AnalyticsResponseDto(period, dbMetrics, postHogMetrics);

        var cacheDuration = postHogFailed
            ? TimeSpan.FromMinutes(1)
            : TimeSpan.FromMinutes(5);

        _cache.Set(cacheKey, result, cacheDuration);

        return result;
    }

    private async Task<DbMetricsDto> GetDbMetricsAsync(DateTime cutoff, CancellationToken ct)
    {
        var totalUsers = await _db.Users.CountAsync(ct);
        var activeUsers = await _db.Users.CountAsync(u => u.IsActive, ct);
        var newUsers = await _db.Users.CountAsync(u => u.CreatedAt >= cutoff, ct);
        var totalProducts = await _db.Products.CountAsync(ct);
        var activeProducts = await _db.Products.CountAsync(p => p.IsActive, ct);
        var totalOrders = await _db.Orders.CountAsync(ct);

        var ordersInPeriod = await _db.Orders
            .Where(o => o.CreatedAt >= cutoff)
            .Select(o => o.TotalAmount)
            .ToListAsync(ct);

        var ordersInPeriodCount = ordersInPeriod.Count;
        var revenueInPeriod = ordersInPeriod.Sum();
        var avgOrderValue = ordersInPeriodCount > 0 ? ordersInPeriod.Average() : 0m;

        var ordersByStatus = await _db.Orders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync(ct);

        var topProductsRaw = await _db.OrderItems
            .GroupBy(oi => new { oi.ProductId, oi.ProductName, oi.ProductBrand })
            .Select(g => new {
                g.Key.ProductId,
                g.Key.ProductName,
                g.Key.ProductBrand,
                TotalQuantity = g.Sum(x => x.Quantity),
                OrderCount = g.Count(),
            })
            .OrderByDescending(x => x.TotalQuantity)
            .Take(5)
            .ToListAsync(ct);
        var topProducts = topProductsRaw
            .Select(x => new TopProductDto(x.ProductId.ToString(), x.ProductName, x.ProductBrand, x.TotalQuantity, x.OrderCount))
            .ToList();

        var recentOrders = await _db.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto(
                o.OrderNumber,
                o.CustomerName,
                o.TotalAmount,
                "TRY",
                o.Status.ToString(),
                o.CreatedAt))
            .ToListAsync(ct);

        return new DbMetricsDto(
            TotalUsers: totalUsers,
            ActiveUsers: activeUsers,
            NewUsers: newUsers,
            TotalProducts: totalProducts,
            ActiveProducts: activeProducts,
            TotalOrders: totalOrders,
            OrdersInPeriod: ordersInPeriodCount,
            RevenueInPeriod: revenueInPeriod,
            AverageOrderValue: avgOrderValue,
            OrdersByStatus: ordersByStatus.Select(x => new OrderStatusCountDto(x.Status, x.Count)).ToList(),
            TopProducts: topProducts,
            RecentOrders: recentOrders
        );
    }

    private async Task<(PostHogMetricsDto metrics, bool failed)> GetPostHogMetricsAsync(DateTime cutoff, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_postHogKey))
        {
            return (new PostHogMetricsDto(
                Available: false,
                UniqueVisitors: null,
                ProductViews: null,
                AddToCart: null,
                CheckoutStarted: null,
                Purchases: null,
                Funnel: null,
                SearchTypeBreakdown: null,
                VinSearchSuccess: null,
                VinSearchFailed: null
            ), false);
        }

        try
        {
            var now = DateTime.UtcNow;
            var from = cutoff.ToString("yyyy-MM-dd HH:mm:ss");
            var to = now.ToString("yyyy-MM-dd HH:mm:ss");

            var uniqueVisitorsTask = QueryUniqueVisitorsAsync(from, to, ct);
            var productViewsTask = QueryEventCountAsync("product_viewed", from, to, ct);
            var addToCartTask = QueryEventCountAsync("add_to_cart", from, to, ct);
            var checkoutStartedTask = QueryEventCountAsync("checkout_started", from, to, ct);
            var purchasesTask = QueryEventCountAsync("purchase_completed", from, to, ct);
            var pageViewsTask = QueryEventCountAsync("$pageview", from, to, ct);
            var searchTypeTask = QuerySearchTypeBreakdownAsync(from, to, ct);
            var vinSuccessTask = QueryVinSearchAsync(true, from, to, ct);
            var vinFailedTask = QueryVinSearchAsync(false, from, to, ct);

            await Task.WhenAll(
                uniqueVisitorsTask, productViewsTask, addToCartTask,
                checkoutStartedTask, purchasesTask, pageViewsTask,
                searchTypeTask, vinSuccessTask, vinFailedTask);

            var pageViews = await pageViewsTask;
            var productViews = await productViewsTask;
            var addToCart = await addToCartTask;
            var checkoutStarted = await checkoutStartedTask;
            var purchases = await purchasesTask;

            var funnel = new List<FunnelStepDto>
            {
                new("Ziyaret", "$pageview", pageViews ?? 0),
                new("Ürün Görüntüleme", "product_viewed", productViews ?? 0),
                new("Sepete Ekleme", "add_to_cart", addToCart ?? 0),
                new("Checkout", "checkout_started", checkoutStarted ?? 0),
                new("Satın Alma", "purchase_completed", purchases ?? 0),
            };

            return (new PostHogMetricsDto(
                Available: true,
                UniqueVisitors: await uniqueVisitorsTask,
                ProductViews: productViews,
                AddToCart: addToCart,
                CheckoutStarted: checkoutStarted,
                Purchases: purchases,
                Funnel: funnel,
                SearchTypeBreakdown: await searchTypeTask,
                VinSearchSuccess: await vinSuccessTask,
                VinSearchFailed: await vinFailedTask
            ), false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "PostHog metrics query failed");
            return (new PostHogMetricsDto(
                Available: false,
                UniqueVisitors: null,
                ProductViews: null,
                AddToCart: null,
                CheckoutStarted: null,
                Purchases: null,
                Funnel: null,
                SearchTypeBreakdown: null,
                VinSearchSuccess: null,
                VinSearchFailed: null
            ), true);
        }
    }

    private async Task<long?> QueryEventCountAsync(string eventName, string from, string to, CancellationToken ct)
    {
        var hogql = $"SELECT count() FROM events WHERE event = '{EscapeHogQL(eventName)}' AND timestamp >= toDateTime('{from}') AND timestamp <= toDateTime('{to}')";
        var results = await ExecuteHogQLAsync(hogql, ct);
        if (results is null || results.Count == 0 || results[0].Count == 0) return null;
        return Convert.ToInt64(results[0][0]);
    }

    private async Task<long?> QueryUniqueVisitorsAsync(string from, string to, CancellationToken ct)
    {
        var hogql = $"SELECT count(DISTINCT distinct_id) FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('{from}') AND timestamp <= toDateTime('{to}')";
        var results = await ExecuteHogQLAsync(hogql, ct);
        if (results is null || results.Count == 0 || results[0].Count == 0) return null;
        return Convert.ToInt64(results[0][0]);
    }

    private async Task<long?> QueryVinSearchAsync(bool found, string from, string to, CancellationToken ct)
    {
        var foundStr = found ? "true" : "false";
        var hogql = $"SELECT count() FROM events WHERE event = 'vin_search_completed' AND properties.found = {foundStr} AND timestamp >= toDateTime('{from}') AND timestamp <= toDateTime('{to}')";
        var results = await ExecuteHogQLAsync(hogql, ct);
        if (results is null || results.Count == 0 || results[0].Count == 0) return null;
        return Convert.ToInt64(results[0][0]);
    }

    private async Task<List<SearchTypeDto>?> QuerySearchTypeBreakdownAsync(string from, string to, CancellationToken ct)
    {
        var hogql = $"SELECT properties.search_type, count() FROM events WHERE event = 'product_searched' AND timestamp >= toDateTime('{from}') AND timestamp <= toDateTime('{to}') GROUP BY properties.search_type";
        var results = await ExecuteHogQLAsync(hogql, ct);
        if (results is null) return null;

        return results
            .Where(row => row.Count >= 2 && row[0] is not null)
            .Select(row => new SearchTypeDto(
                row[0]?.ToString() ?? "unknown",
                Convert.ToInt64(row[1])
            ))
            .ToList();
    }

    private async Task<List<List<object?>>?> ExecuteHogQLAsync(string query, CancellationToken ct)
    {
        var url = $"{_postHogHost}/api/projects/{_postHogProjectId}/query";

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("Authorization", $"Bearer {_postHogKey}");

        var body = new { query = new { kind = "HogQLQuery", query } };
        request.Content = JsonContent.Create(body);

        using var response = await _http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.TryGetProperty("results", out var resultsEl))
            return null;

        var rows = new List<List<object?>>();
        foreach (var row in resultsEl.EnumerateArray())
        {
            var cols = new List<object?>();
            foreach (var col in row.EnumerateArray())
            {
                cols.Add(col.ValueKind switch
                {
                    JsonValueKind.Number => col.TryGetInt64(out var l) ? (object?)l : col.GetDouble(),
                    JsonValueKind.String => col.GetString(),
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    JsonValueKind.Null => null,
                    _ => col.GetRawText()
                });
            }
            rows.Add(cols);
        }
        return rows;
    }

    private static string EscapeHogQL(string value) =>
        value.Replace("'", "\\'");
}
