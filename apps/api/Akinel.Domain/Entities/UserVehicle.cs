using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class UserVehicle : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid VehicleEngineId { get; set; }
    public VehicleEngine VehicleEngine { get; set; } = null!;
    public string? Nickname { get; set; }
    public string? LicensePlate { get; set; }
    public int? Year { get; set; }
    public bool IsDefault { get; set; } = false;
}
