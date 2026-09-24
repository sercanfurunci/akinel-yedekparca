using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class OemNumber : BaseEntity
{
    public string Number { get; set; } = string.Empty;
    public string NormalizedNumber { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public ICollection<ProductOemNumber> Products { get; set; } = new List<ProductOemNumber>();
}
