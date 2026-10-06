namespace Akinel.Application.DTOs;

public record VehicleMakeDto(Guid Id, string Name, string Slug, string? LogoUrl, bool IsPopular = false);
public record VehicleModelDto(Guid Id, string Name, string Slug, Guid VehicleMakeId, string? ImageUrl);
public record VehicleGenerationDto(Guid Id, string Name, string Slug, Guid VehicleModelId, int? YearFrom, int? YearTo, string? BodyType);
public record VehicleEngineDto(Guid Id, string Name, Guid VehicleGenerationId, string? Displacement, string? FuelType, int? PowerKw, int? PowerHp, int? YearFrom, int? YearTo, string? EngineCode);

public record VehicleContextDto(
    Guid EngineId,
    string MakeName,
    string ModelName,
    string GenerationName,
    string EngineName,
    string DisplayLabel
);
