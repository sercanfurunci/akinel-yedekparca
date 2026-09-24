using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class VehicleEngine : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid VehicleGenerationId { get; set; }
    public VehicleGeneration VehicleGeneration { get; set; } = null!;
    public string? Displacement { get; set; }
    public string? FuelType { get; set; }
    public int? PowerKw { get; set; }
    public int? PowerHp { get; set; }
    public int? YearFrom { get; set; }
    public int? YearTo { get; set; }
    public string? EngineCode { get; set; }
    public int? ExternalId { get; set; }
    public int? DisplacementCc { get; set; }
    public string? Gearbox { get; set; }
    public string? Drivetrain { get; set; }
    public ICollection<ProductVehicleCompatibility> ProductCompatibilities { get; set; } = new List<ProductVehicleCompatibility>();
    public ICollection<UserVehicle> UserVehicles { get; set; } = new List<UserVehicle>();
}
