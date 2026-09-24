using Akinel.Domain.Common;
using Akinel.Domain.Enums;

namespace Akinel.Domain.Entities;

public class Stock : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; } = 0;
    public int ReservedQuantity { get; set; } = 0;
    public int MinimumStockLevel { get; set; } = 5;
    public new DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int AvailableQuantity => Quantity - ReservedQuantity;

    public StockStatus Status => AvailableQuantity <= 0
        ? StockStatus.OutOfStock
        : AvailableQuantity <= MinimumStockLevel
            ? StockStatus.LowStock
            : StockStatus.InStock;
}
