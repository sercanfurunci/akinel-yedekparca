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
    private readonly IVinDecoder _vinDecoder;

    public VehicleService(AkinelDbContext context, IPartsCatalogProvider catalogProvider, IVinDecoder vinDecoder)
    {
        _context = context;
        _catalogProvider = catalogProvider;
        _vinDecoder = vinDecoder;
    }

    public async Task<IEnumerable<VehicleMakeDto>> GetMakesAsync(CancellationToken ct = default)
        => await _context.VehicleMakes
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.Name)
            .Select(m => new VehicleMakeDto(m.Id, m.Name, m.Slug, m.LogoUrl, m.IsPopular))
            .ToListAsync(ct);

    public async Task<IEnumerable<VehicleModelDto>> GetModelsByMakeAsync(Guid makeId, CancellationToken ct = default)
        => await _context.VehicleModels
            .AsNoTracking()
            .Where(m => m.VehicleMakeId == makeId)
            .OrderBy(m => m.Name)
            .Select(m => new VehicleModelDto(m.Id, m.Name, m.Slug, m.VehicleMakeId, m.ImageUrl))
            .ToListAsync(ct);

    public async Task<IEnumerable<VehicleGenerationDto>> GetGenerationsByModelAsync(Guid modelId, CancellationToken ct = default)
        => await _context.VehicleGenerations
            .AsNoTracking()
            .Where(g => g.VehicleModelId == modelId)
            .OrderBy(g => g.YearFrom)
            .Select(g => new VehicleGenerationDto(g.Id, g.Name, g.Slug, g.VehicleModelId, g.YearFrom, g.YearTo, g.BodyType))
            .ToListAsync(ct);

    public async Task<IEnumerable<VehicleEngineDto>> GetEnginesByGenerationAsync(Guid generationId, CancellationToken ct = default)
        => await _context.VehicleEngines
            .AsNoTracking()
            .Where(e => e.VehicleGenerationId == generationId)
            .OrderBy(e => e.Name)
            .Select(e => new VehicleEngineDto(e.Id, e.Name, e.VehicleGenerationId, e.Displacement, e.FuelType, e.PowerKw, e.PowerHp, e.YearFrom, e.YearTo, e.EngineCode))
            .ToListAsync(ct);

    public async Task<VehicleContextDto?> GetVehicleContextAsync(Guid engineId, CancellationToken ct = default)
    {
        // Project directly into DTO — no entity hydration, no Include chain needed.
        var ctx = await _context.VehicleEngines
            .AsNoTracking()
            .Where(e => e.Id == engineId)
            .Select(e => new VehicleContextDto(
                e.Id,
                e.VehicleGeneration.VehicleModel.VehicleMake.Name,
                e.VehicleGeneration.VehicleModel.Name,
                e.VehicleGeneration.Name,
                e.Name,
                e.VehicleGeneration.VehicleModel.VehicleMake.Name + " " +
                e.VehicleGeneration.VehicleModel.Name + " " +
                e.VehicleGeneration.Name + " " + e.Name))
            .FirstOrDefaultAsync(ct);

        return ctx;
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

    public async Task<VinDecodeDto?> DecodeVinRichAsync(string vin, CancellationToken ct = default)
    {
        var decoded = await _vinDecoder.DecodeAsync(vin, ct);
        if (decoded == null) return null;

        var dto = new VinDecodeDto
        {
            Vin = decoded.Vin,
            Make = decoded.Make,
            Model = decoded.Model,
            Year = decoded.Year,
            FuelType = decoded.FuelType,
            Displacement = decoded.Displacement,
            EngineCode = decoded.EngineCode,
            BodyStyle = decoded.BodyStyle,
            Transmission = decoded.Transmission,
            Country = decoded.Country,
            ManufacturerName = decoded.ManufacturerName,
            IsPartial = decoded.IsPartial,
        };

        if (string.IsNullOrWhiteSpace(decoded.Make))
        {
            dto.PossibleMatches = [];
            return dto;
        }

        // Try to map to internal catalog
        var makeLower = decoded.Make.ToLowerInvariant();
        var modelLower = decoded.Model?.ToLowerInvariant() ?? "";

        // Find matching make
        var make = await _context.VehicleMakes
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Name.ToLower().Contains(makeLower) || makeLower.Contains(m.Name.ToLower()), ct);

        if (make == null)
        {
            dto.PossibleMatches = [];
            return dto;
        }

        // Find matching models
        var matchingModels = await _context.VehicleModels
            .AsNoTracking()
            .Where(m => m.VehicleMakeId == make.Id &&
                        (m.Name.ToLower().Contains(modelLower) || modelLower.Contains(m.Name.ToLower())))
            .Select(m => m.Id)
            .ToListAsync(ct);

        if (matchingModels.Count == 0)
        {
            dto.PossibleMatches = [];
            return dto;
        }

        // Find generations that match the year (if available)
        var generationQuery = _context.VehicleGenerations
            .AsNoTracking()
            .Where(g => matchingModels.Contains(g.VehicleModelId));

        if (int.TryParse(decoded.Year, out var year))
        {
            generationQuery = generationQuery.Where(g =>
                (g.YearFrom == null || g.YearFrom <= year) &&
                (g.YearTo == null || g.YearTo >= year));
        }

        var matchingGenerationIds = await generationQuery
            .Select(g => g.Id)
            .ToListAsync(ct);

        if (matchingGenerationIds.Count == 0)
        {
            // Relax year constraint — return all generations under the matching models
            matchingGenerationIds = await _context.VehicleGenerations
                .AsNoTracking()
                .Where(g => matchingModels.Contains(g.VehicleModelId))
                .Select(g => g.Id)
                .ToListAsync(ct);
        }

        if (matchingGenerationIds.Count == 0)
        {
            dto.PossibleMatches = [];
            return dto;
        }

        // Get engines under matching generations
        var engines = await _context.VehicleEngines
            .AsNoTracking()
            .Include(e => e.VehicleGeneration)
                .ThenInclude(g => g.VehicleModel)
                    .ThenInclude(m => m.VehicleMake)
            .Where(e => matchingGenerationIds.Contains(e.VehicleGenerationId))
            .ToListAsync(ct);

        var matches = engines.Select(e => new InternalVehicleMatchDto
        {
            EngineId = e.Id,
            GenerationId = e.VehicleGenerationId,
            EngineDisplay = e.Name,
            GenerationDisplay = FormatGeneration(e.VehicleGeneration),
            ModelDisplay = e.VehicleGeneration.VehicleModel.Name,
            MakeDisplay = e.VehicleGeneration.VehicleModel.VehicleMake.Name,
        }).ToList();

        if (matches.Count == 1)
        {
            dto.InternalVehicle = matches[0];
            dto.PossibleMatches = [];
        }
        else if (matches.Count > 1)
        {
            dto.InternalVehicle = null;
            dto.PossibleMatches = matches;
        }
        else
        {
            dto.PossibleMatches = [];
        }

        return dto;
    }

    private static string FormatGeneration(Akinel.Domain.Entities.VehicleGeneration gen)
    {
        var years = gen.YearFrom.HasValue
            ? (gen.YearTo.HasValue ? $"{gen.YearFrom}–{gen.YearTo}" : $"{gen.YearFrom}–")
            : "";
        return string.IsNullOrWhiteSpace(years) ? gen.Name : $"{gen.Name} ({years})";
    }
}
