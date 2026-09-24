using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class VehicleMake : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int? ExternalId { get; set; }
    public ICollection<VehicleModel> Models { get; set; } = new List<VehicleModel>();
}
