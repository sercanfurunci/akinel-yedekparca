using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class VehicleGeneration : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid VehicleModelId { get; set; }
    public VehicleModel VehicleModel { get; set; } = null!;
    public int? YearFrom { get; set; }
    public int? YearTo { get; set; }
    public string? BodyType { get; set; }
    public int? ExternalId { get; set; }
    public ICollection<VehicleEngine> Engines { get; set; } = new List<VehicleEngine>();
}
