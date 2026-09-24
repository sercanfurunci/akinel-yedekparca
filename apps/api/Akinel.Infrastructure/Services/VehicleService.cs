using Akinel.Application.Contracts;
using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Services;

public class VehicleService : IVehicleService
{
    private readonly AkinelDbContext _context;
    private readonly IPartsCatalogProvider _catalogProvider;

    public VehicleService(AkinelDbContext context, IPartsCatalogProvider catalogProvider)
    {
        _context = context;
        _catalogProvider = catalogProvider;
    }

    public async Task<IEnumerable<VehicleMakeDto>> GetMakesAsync(CancellationToken ct = default)
        => await _context.VehicleMakes
            .Where(m => m.IsActive)
            .OrderBy(m => m.Name)
            .Select(m => new VehicleMakeDto(m.Id, m.Name, m.Slug, m.LogoUrl))
            .ToListAsync(ct);

    public async Task<IEnumerable<VehicleModelDto>> GetModelsByMakeAsync(Guid makeId, CancellationToken ct = default)
        => await _context.VehicleModels
            .Where(m => m.VehicleMakeId == makeId)
            .OrderBy(m => m.Name)
            .Select(m => new VehicleModelDto(m.Id, m.Name, m.Slug, m.VehicleMakeId))
            .ToListAsync(ct);

    public async Task<IEnumerable<VehicleGenerationDto>> GetGenerationsByModelAsync(Guid modelId, CancellationToken ct = default)
        => await _context.VehicleGenerations
            .Where(g => g.VehicleModelId == modelId)
            .OrderBy(g => g.YearFrom)
            .Select(g => new VehicleGenerationDto(g.Id, g.Name, g.Slug, g.VehicleModelId, g.YearFrom, g.YearTo, g.BodyType))
            .ToListAsync(ct);

    public async Task<IEnumerable<VehicleEngineDto>> GetEnginesByGenerationAsync(Guid generationId, CancellationToken ct = default)
        => await _context.VehicleEngines
            .Where(e => e.VehicleGenerationId == generationId)
            .OrderBy(e => e.Name)
            .Select(e => new VehicleEngineDto(e.Id, e.Name, e.VehicleGenerationId, e.Displacement, e.FuelType, e.PowerKw, e.PowerHp, e.YearFrom, e.YearTo, e.EngineCode))
            .ToListAsync(ct);

    public async Task<VehicleContextDto?> GetVehicleContextAsync(Guid engineId, CancellationToken ct = default)
    {
        var engine = await _context.VehicleEngines
            .Include(e => e.VehicleGeneration)
                .ThenInclude(g => g.VehicleModel)
                    .ThenInclude(m => m.VehicleMake)
            .FirstOrDefaultAsync(e => e.Id == engineId, ct);

        if (engine == null) return null;

        var make = engine.VehicleGeneration.VehicleModel.VehicleMake;
        var model = engine.VehicleGeneration.VehicleModel;
        var gen = engine.VehicleGeneration;

        return new VehicleContextDto(
            engine.Id,
            make.Name,
            model.Name,
            gen.Name,
            engine.Name,
            $"{make.Name} {model.Name} {gen.Name} {engine.Name}"
        );
    }

    public async Task<VehicleContextDto?> DecodeVinAsync(string vin, CancellationToken ct = default)
    {
        var result = await _catalogProvider.GetVehicleByVinAsync(vin, ct);
        if (result == null) return null;

        var engine = await _context.VehicleEngines
            .Include(e => e.VehicleGeneration)
                .ThenInclude(g => g.VehicleModel)
                    .ThenInclude(m => m.VehicleMake)
            .FirstOrDefaultAsync(e =>
                e.VehicleGeneration.VehicleModel.VehicleMake.Name == result.Make &&
                e.VehicleGeneration.VehicleModel.Name == result.Model, ct);

        return engine == null ? null : await GetVehicleContextAsync(engine.Id, ct);
    }
}
