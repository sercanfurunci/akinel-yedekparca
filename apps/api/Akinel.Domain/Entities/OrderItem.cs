using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid ProductId { get; set; }

    // Snapshot data — stored at order time, never changes
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    public string? ProductBrand { get; set; }
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
