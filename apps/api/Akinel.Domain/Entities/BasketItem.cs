using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class BasketItem : BaseEntity
{
    public string SessionId { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
}
