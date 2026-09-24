using Akinel.Application.DTOs;
using Akinel.Domain.Enums;

namespace Akinel.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(string sessionId, Guid? userId, CheckoutRequest request, CancellationToken ct = default);
    Task<List<OrderSummaryDto>> GetUserOrdersAsync(Guid userId, CancellationToken ct = default);
    Task<OrderDto?> GetOrderByIdAsync(Guid id, Guid? userId, bool isAdmin, CancellationToken ct = default);
    Task<List<OrderSummaryDto>> GetAllOrdersAsync(int page, int pageSize, CancellationToken ct = default);
    Task<OrderDto?> UpdateOrderStatusAsync(Guid id, OrderStatus status, CancellationToken ct = default);
}
