using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class StockNotification : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Email { get; set; } = string.Empty;
    public DateTime? NotifiedAt { get; set; }
}
