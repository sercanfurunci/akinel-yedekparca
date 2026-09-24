using System.ComponentModel.DataAnnotations;
using Akinel.Domain.Enums;

namespace Akinel.Application.DTOs;

public record CheckoutRequest(
    [Required][MaxLength(100)] string CustomerName,
    [Required][EmailAddress][MaxLength(200)] string CustomerEmail,
    [Required][MaxLength(20)] string CustomerPhone,
    [Required][MaxLength(300)] string ShippingAddress,
    [Required][MaxLength(100)] string ShippingCity,
    [Required][MaxLength(100)] string ShippingDistrict,
    [MaxLength(10)] string? ShippingPostalCode,
    [MaxLength(500)] string? ShippingNotes,
    PaymentMethod PaymentMethod,
    [Required] bool TermsAccepted = false,
    [Required] bool PrivacyAccepted = false,
    [Required] bool DistanceSalesAccepted = false,
    bool MarketingConsent = false
);

public record OrderDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string ShippingAddress,
    string ShippingCity,
    string ShippingDistrict,
    string ShippingPostalCode,
    string ShippingNotes,
    decimal SubTotal,
    decimal ShippingCost,
    decimal TotalAmount,
    string Status,
    string PaymentMethod,
    bool IsPaid,
    List<OrderItemDto> Items,
    DateTime CreatedAt
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductBrand,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal
);

public record OrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    decimal TotalAmount,
    string Status,
    int ItemCount,
    DateTime CreatedAt
);

public record UpdateOrderStatusRequest(OrderStatus Status);
