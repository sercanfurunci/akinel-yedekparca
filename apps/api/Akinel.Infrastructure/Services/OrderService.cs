using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AkinelDbContext _db;

    // State machine: defines which transitions are allowed
    private static readonly Dictionary<OrderStatus, OrderStatus[]> AllowedTransitions = new()
    {
        [OrderStatus.Pending]   = [OrderStatus.Confirmed, OrderStatus.Cancelled],
        [OrderStatus.Confirmed] = [OrderStatus.Preparing, OrderStatus.Cancelled],
        [OrderStatus.Preparing] = [OrderStatus.Shipped,   OrderStatus.Cancelled],
        [OrderStatus.Shipped]   = [OrderStatus.Delivered],
        [OrderStatus.Delivered] = [],
        [OrderStatus.Cancelled] = [],
    };

    public OrderService(AkinelDbContext db) => _db = db;

    public async Task<OrderDto> CreateOrderAsync(string sessionId, Guid? userId, CheckoutRequest request, CancellationToken ct = default)
    {
        // Fetch basket items BEFORE the transaction — failure here rolls nothing back
        var basketItems = await _db.BasketItems
            .Include(b => b.Product)
                .ThenInclude(p => p.Brand)
            .Include(b => b.Product)
                .ThenInclude(p => p.Images)
            .Include(b => b.Product)
                .ThenInclude(p => p.Stock)
            .Where(b => b.SessionId == sessionId && b.Product != null)
            .ToListAsync(ct);

        if (basketItems.Count == 0)
            throw new InvalidOperationException("Sepet boş.");

        if (!request.TermsAccepted || !request.PrivacyAccepted || !request.DistanceSalesAccepted)
            throw new InvalidOperationException("Sipariş tamamlamak için gerekli sözleşmelerin onaylanması gerekmektedir.");

        // Validate products are active before entering transaction
        foreach (var item in basketItems)
        {
            if (!item.Product.IsActive)
                throw new InvalidOperationException($"Ürün mevcut değil: {item.Product.Name}");
        }

        // Calculate totals server-side — never trust client values
        var subTotal = basketItems.Sum(b => EffectivePrice(b.Product) * b.Quantity);
        const decimal shippingCost = 0m;
        var totalAmount = subTotal + shippingCost;

        // Build order with product snapshots captured at this moment
        var order = new Order
        {
            OrderNumber = string.Empty, // assigned inside transaction
            UserId = userId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            ShippingAddress = request.ShippingAddress,
            ShippingCity = request.ShippingCity,
            ShippingDistrict = request.ShippingDistrict,
            ShippingPostalCode = request.ShippingPostalCode ?? string.Empty,
            ShippingNotes = request.ShippingNotes ?? string.Empty,
            SubTotal = subTotal,
            ShippingCost = shippingCost,
            TotalAmount = totalAmount,
            Status = OrderStatus.Pending,
            PaymentMethod = request.PaymentMethod,
            IsPaid = false,
            TermsAccepted = request.TermsAccepted,
            PrivacyAccepted = request.PrivacyAccepted,
            DistanceSalesAccepted = request.DistanceSalesAccepted,
            MarketingConsent = request.MarketingConsent,
            ConsentTimestamp = DateTime.UtcNow,
        };

        // Snapshot product info into order items at purchase time
        foreach (var b in basketItems)
        {
            var primaryImage = b.Product.Images.FirstOrDefault(i => i.IsPrimary)?.Url
                               ?? b.Product.Images.FirstOrDefault()?.Url;
            order.Items.Add(new OrderItem
            {
                ProductId = b.ProductId,
                ProductName = b.Product.Name,
                ProductSku = b.Product.SKU,
                ProductBrand = b.Product.Brand?.Name,
                ProductImageUrl = primaryImage,
                UnitPrice = EffectivePrice(b.Product),
                Quantity = b.Quantity,
                LineTotal = EffectivePrice(b.Product) * b.Quantity,
            });
        }

        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            // Atomic stock decrement — WHERE prevents overselling under concurrent load
            foreach (var item in basketItems)
            {
                var updated = await _db.Stocks
                    .Where(s => s.ProductId == item.ProductId &&
                                (s.Quantity - s.ReservedQuantity) >= item.Quantity)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(p => p.Quantity, p => p.Quantity - item.Quantity), ct);

                if (updated == 0)
                    throw new InvalidOperationException($"'{item.Product.Name}' için yeterli stok yok.");
            }

            // Generate order number inside the transaction to avoid racing on the same sequence
            var dateStr = DateTime.UtcNow.ToString("yyyyMMdd");
            var todayMax = await _db.Orders
                .Where(o => o.OrderNumber.StartsWith($"AKN-{dateStr}-"))
                .MaxAsync(o => (string?)o.OrderNumber, ct);

            int nextSeq = 1;
            if (todayMax != null)
            {
                var parts = todayMax.Split('-');
                if (parts.Length == 3 && int.TryParse(parts[2], out var seq))
                    nextSeq = seq + 1;
            }

            order.OrderNumber = $"AKN-{dateStr}-{nextSeq:D4}";

            _db.Orders.Add(order);
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }

        // Basket cleanup AFTER commit — failure here does NOT roll back the committed order
        try
        {
            await _db.BasketItems
                .Where(b => b.SessionId == sessionId)
                .ExecuteDeleteAsync(ct);
        }
        catch
        {
            // Log but do not throw — the order is already committed successfully
        }

        return MapToDto(order);
    }

    public async Task<List<OrderSummaryDto>> GetUserOrdersAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToSummary(o))
            .ToListAsync(ct);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid id, Guid? userId, bool isAdmin, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (order == null) return null;
        if (!isAdmin && order.UserId != userId) return null;

        return MapToDto(order);
    }

    public async Task<List<OrderSummaryDto>> GetAllOrdersAsync(int page, int pageSize, CancellationToken ct = default)
    {
        return await _db.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => MapToSummary(o))
            .ToListAsync(ct);
    }

    public async Task<OrderDto?> UpdateOrderStatusAsync(Guid id, OrderStatus newStatus, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (order == null) return null;

        // Enforce state machine transitions
        if (!AllowedTransitions.TryGetValue(order.Status, out var allowed) ||
            !allowed.Contains(newStatus))
        {
            throw new InvalidOperationException(
                $"'{order.Status}' durumundan '{newStatus}' durumuna geçiş yapılamaz.");
        }

        // Restore stock when cancelling
        if (newStatus == OrderStatus.Cancelled)
        {
            foreach (var item in order.Items)
            {
                await _db.Stocks
                    .Where(s => s.ProductId == item.ProductId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(p => p.Quantity, p => p.Quantity + item.Quantity), ct);
            }
        }

        order.Status = newStatus;
        await _db.SaveChangesAsync(ct);
        return MapToDto(order);
    }

    private static OrderDto MapToDto(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.CustomerName,
        o.CustomerEmail,
        o.ShippingAddress,
        o.ShippingCity,
        o.ShippingDistrict,
        o.ShippingPostalCode,
        o.ShippingNotes,
        o.SubTotal,
        o.ShippingCost,
        o.TotalAmount,
        o.Status.ToString(),
        o.PaymentMethod.ToString(),
        o.IsPaid,
        o.Items.Select(i => new OrderItemDto(
            i.Id,
            i.ProductId,
            i.ProductName,
            i.ProductBrand,
            i.ProductImageUrl,
            i.UnitPrice,
            i.Quantity,
            i.LineTotal
        )).ToList(),
        o.CreatedAt
    );

    private static decimal EffectivePrice(Domain.Entities.Product p) =>
        p.DiscountPercentage.HasValue && p.DiscountPercentage.Value > 0
            ? Math.Round(p.Price * (1 - p.DiscountPercentage.Value / 100m), 2)
            : p.Price;

    private static OrderSummaryDto MapToSummary(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.CustomerName,
        o.CustomerEmail,
        o.TotalAmount,
        o.Status.ToString(),
        o.Items.Count,
        o.CreatedAt
    );
}
