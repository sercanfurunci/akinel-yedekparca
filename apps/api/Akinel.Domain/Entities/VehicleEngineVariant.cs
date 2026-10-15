using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class VehicleEngineVariant : BaseEntity
{
    public Guid VehicleEngineId { get; set; }
    public VehicleEngine VehicleEngine { get; set; } = null!;
    public string SubModelName { get; set; } = string.Empty;
    public string? OpsCarId { get; set; }
    public string? DatECode { get; set; }
}
