namespace Akinel.Domain.Entities;

public class ProductOemNumber
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid OemNumberId { get; set; }
    public OemNumber OemNumber { get; set; } = null!;
}
