using Akinel.Domain.Common;
using Akinel.Domain.Enums;

namespace Akinel.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid? UserId { get; set; }

    // Customer info
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    // Shipping
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingDistrict { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingNotes { get; set; } = string.Empty;

    // Totals
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal TotalAmount { get; set; }

    // Status
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CreditCard;
    public bool IsPaid { get; set; } = false;
    public string? PaymentReference { get; set; }

    // Legal consent tracking
    public bool TermsAccepted { get; set; } = false;
    public bool PrivacyAccepted { get; set; } = false;
    public bool DistanceSalesAccepted { get; set; } = false;
    public bool MarketingConsent { get; set; } = false;
    public DateTime? ConsentTimestamp { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}
