namespace Akinel.Domain.Entities;

public class ProductVehicleCompatibility
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid VehicleEngineId { get; set; }
    public VehicleEngine VehicleEngine { get; set; } = null!;
    public string? Notes { get; set; }
}
