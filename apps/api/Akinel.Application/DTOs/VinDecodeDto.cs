namespace Akinel.Application.DTOs;

public class VinDecodeDto
{
    public string Vin { get; set; } = "";
    public string? Make { get; set; }
    public string? Model { get; set; }
    public string? Year { get; set; }
    public string? FuelType { get; set; }
    public string? Displacement { get; set; }
    public string? EngineCode { get; set; }
    public string? BodyStyle { get; set; }
    public string? Transmission { get; set; }
    public string? Country { get; set; }
    public string? ManufacturerName { get; set; }
    public bool IsPartial { get; set; }
    public InternalVehicleMatchDto? InternalVehicle { get; set; }
    public IEnumerable<InternalVehicleMatchDto> PossibleMatches { get; set; } = [];
}

public class InternalVehicleMatchDto
{
    public Guid EngineId { get; set; }
    public Guid GenerationId { get; set; }
    public string EngineDisplay { get; set; } = "";
    public string GenerationDisplay { get; set; } = "";
    public string ModelDisplay { get; set; } = "";
    public string MakeDisplay { get; set; } = "";
}
