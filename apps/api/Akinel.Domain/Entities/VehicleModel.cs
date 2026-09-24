using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class VehicleModel : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid VehicleMakeId { get; set; }
    public VehicleMake VehicleMake { get; set; } = null!;
    public int? ExternalId { get; set; }
    public ICollection<VehicleGeneration> Generations { get; set; } = new List<VehicleGeneration>();
}
