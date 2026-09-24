using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface IVehicleService
{
    Task<IEnumerable<VehicleMakeDto>> GetMakesAsync(CancellationToken ct = default);
    Task<IEnumerable<VehicleModelDto>> GetModelsByMakeAsync(Guid makeId, CancellationToken ct = default);
    Task<IEnumerable<VehicleGenerationDto>> GetGenerationsByModelAsync(Guid modelId, CancellationToken ct = default);
    Task<IEnumerable<VehicleEngineDto>> GetEnginesByGenerationAsync(Guid generationId, CancellationToken ct = default);
    Task<VehicleContextDto?> GetVehicleContextAsync(Guid engineId, CancellationToken ct = default);
    Task<VehicleContextDto?> DecodeVinAsync(string vin, CancellationToken ct = default);
}
