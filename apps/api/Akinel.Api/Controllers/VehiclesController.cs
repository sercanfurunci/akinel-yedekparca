using Akinel.Application.Services;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly IProductService _productService;
    private readonly IFeatureFlagService _features;
    private readonly AkinelDbContext _db;

    public VehiclesController(IVehicleService vehicleService, IProductService productService, IFeatureFlagService features, AkinelDbContext db)
    {
        _vehicleService = vehicleService;
        _productService = productService;
        _features = features;
        _db = db;
    }

    [HttpGet("makes")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetMakes(CancellationToken ct)
        => Ok(await _vehicleService.GetMakesAsync(ct));

    [HttpGet("makes/popular")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetPopularMakes(CancellationToken ct)
    {
        var makes = await _vehicleService.GetMakesAsync(ct);
        var popular = makes.Where(m => m.IsPopular).ToList();
        return Ok(popular.Count > 0 ? popular : makes.Take(8).ToList());
    }

    [HttpGet("makes/{makeId:guid}/models")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetModels(Guid makeId, CancellationToken ct)
        => Ok(await _vehicleService.GetModelsByMakeAsync(makeId, ct));

    [HttpGet("makes/{makeId:guid}/generations")]
    [ResponseCache(Duration = 1800, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetGenerationsByMake(Guid makeId, [FromQuery] int limit = 0, CancellationToken ct = default)
    {
        var query = _db.VehicleGenerations
            .AsNoTracking()
            .Where(g => g.VehicleModel.VehicleMakeId == makeId)
            .OrderBy(g => g.ImageUrl == null ? 1 : 0).ThenBy(g => g.VehicleModel.Name).ThenBy(g => g.YearFrom)
            .Select(g => new {
                g.Id, g.Name, g.Slug, g.YearFrom, g.YearTo, g.BodyType, g.ImageUrl,
                modelId = g.VehicleModelId, modelName = g.VehicleModel.Name
            });
        var gens = limit > 0
            ? await query.Take(limit).ToListAsync(ct)
            : await query.ToListAsync(ct);
        return Ok(gens);
    }

    [HttpGet("models/{modelId:guid}/generations")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetGenerations(Guid modelId, CancellationToken ct)
        => Ok(await _vehicleService.GetGenerationsByModelAsync(modelId, ct));

    [HttpGet("generations/{generationId:guid}/engines")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetEngines(Guid generationId, CancellationToken ct)
        => Ok(await _vehicleService.GetEnginesByGenerationAsync(generationId, ct));

    [HttpGet("context/{engineId:guid}")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client, VaryByHeader = "Origin")]
    public async Task<IActionResult> GetContext(Guid engineId, CancellationToken ct)
    {
        var ctx = await _vehicleService.GetVehicleContextAsync(engineId, ct);
        return ctx == null ? NotFound() : Ok(ctx);
    }

    [HttpGet("{engineId:guid}/products")]
    public async Task<IActionResult> GetProducts(Guid engineId, [FromQuery] int page = 1, [FromQuery] int pageSize = 24, CancellationToken ct = default)
        => Ok(await _productService.GetByVehicleAsync(engineId, page, pageSize, ct));

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new { makes = Array.Empty<object>(), models = Array.Empty<object>(), engines = Array.Empty<object>() });

        var lower = q.ToLower();

        // Run three queries in parallel against separate DbContext scopes would require
        // scope management; keep sequential but trimmed. Projections already avoid full
        // entity hydration — Include() was redundant and has been removed.
        var makes = await _db.VehicleMakes
            .AsNoTracking()
            .Where(m => m.Name.ToLower().Contains(lower) && m.IsActive)
            .Take(5)
            .Select(m => new { m.Id, m.Name, type = "make" })
            .ToListAsync(ct);

        var models = await _db.VehicleModels
            .AsNoTracking()
            .Where(m => m.Name.ToLower().Contains(lower) && m.VehicleMake.IsActive)
            .Take(5)
            .Select(m => new { m.Id, m.Name, makeName = m.VehicleMake.Name, makeId = m.VehicleMakeId, type = "model" })
            .ToListAsync(ct);

        var engines = await _db.VehicleEngines
            .AsNoTracking()
            .Where(e => (e.Name.ToLower().Contains(lower) ||
                         e.VehicleGeneration.VehicleModel.Name.ToLower().Contains(lower) ||
                         e.VehicleGeneration.VehicleModel.VehicleMake.Name.ToLower().Contains(lower)) &&
                        e.VehicleGeneration.VehicleModel.VehicleMake.IsActive)
            .Take(8)
            .Select(e => new
            {
                e.Id,
                e.Name,
                path = e.VehicleGeneration.VehicleModel.VehicleMake.Name + " " +
                       e.VehicleGeneration.VehicleModel.Name + " " +
                       e.VehicleGeneration.Name + " " + e.Name,
                makeId = e.VehicleGeneration.VehicleModel.VehicleMakeId,
                type = "engine"
            })
            .ToListAsync(ct);

        return Ok(new { makes, models, engines });
    }

    [HttpPost("vin-decode")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("vin")]
    public async Task<IActionResult> DecodeVin([FromBody] VinDecodeRequest request, CancellationToken ct)
    {
        if (!_features.IsEnabled("VinSearch"))
            return StatusCode(503, new { message = "VIN arama şu anda kullanılamamaktadır." });

        if (string.IsNullOrWhiteSpace(request.Vin) || request.Vin.Trim().Length != 17)
            return BadRequest(new { message = "VIN 17 karakter olmalıdır." });

        var result = await _vehicleService.DecodeVinRichAsync(request.Vin.Trim(), ct);
        return result == null ? NotFound(new { message = "Bu VIN numarası için araç bilgisi bulunamadı." }) : Ok(result);
    }
}

public record VinDecodeRequest(string Vin);
