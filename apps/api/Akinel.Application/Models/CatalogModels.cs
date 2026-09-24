namespace Akinel.Application.Models;

public record CatalogVehicleResult(
    string ExternalId,
    string Make,
    string Model,
    string Generation,
    string Engine,
    int? YearFrom,
    int? YearTo,
    string? FuelType,
    int? PowerKw,
    string? EngineCode
);

public record CatalogPartResult(
    string OemNumber,
    string? Name,
    string? Manufacturer,
    IEnumerable<string> CrossReferences
);
