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
    private readonly AkinelDbContext _db;

    public VehiclesController(IVehicleService vehicleService, IProductService productService, AkinelDbContext db)
    {
        _vehicleService = vehicleService;
        _productService = productService;
        _db = db;
    }

    [HttpGet("makes")]
    public async Task<IActionResult> GetMakes(CancellationToken ct)
        => Ok(await _vehicleService.GetMakesAsync(ct));

    [HttpGet("makes/{makeId:guid}/models")]
    public async Task<IActionResult> GetModels(Guid makeId, CancellationToken ct)
        => Ok(await _vehicleService.GetModelsByMakeAsync(makeId, ct));

    [HttpGet("models/{modelId:guid}/generations")]
    public async Task<IActionResult> GetGenerations(Guid modelId, CancellationToken ct)
        => Ok(await _vehicleService.GetGenerationsByModelAsync(modelId, ct));

    [HttpGet("generations/{generationId:guid}/engines")]
    public async Task<IActionResult> GetEngines(Guid generationId, CancellationToken ct)
        => Ok(await _vehicleService.GetEnginesByGenerationAsync(generationId, ct));

    [HttpGet("context/{engineId:guid}")]
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

        var makes = await _db.VehicleMakes
            .Where(m => m.Name.ToLower().Contains(lower) && m.IsActive)
            .Take(5)
            .Select(m => new { m.Id, m.Name, type = "make" })
            .ToListAsync(ct);

        var models = await _db.VehicleModels
            .Include(m => m.VehicleMake)
            .Where(m => m.Name.ToLower().Contains(lower) && m.VehicleMake.IsActive)
            .Take(5)
            .Select(m => new { m.Id, m.Name, makeName = m.VehicleMake.Name, makeId = m.VehicleMakeId, type = "model" })
            .ToListAsync(ct);

        var engines = await _db.VehicleEngines
            .Include(e => e.VehicleGeneration).ThenInclude(g => g.VehicleModel).ThenInclude(m => m.VehicleMake)
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
    public async Task<IActionResult> DecodeVin([FromBody] VinDecodeRequest request, CancellationToken ct)
    {
        var result = await _vehicleService.DecodeVinAsync(request.Vin, ct);
        return result == null ? NotFound(new { message = "Vehicle not found for this VIN." }) : Ok(result);
    }
}

public record VinDecodeRequest(string Vin);
