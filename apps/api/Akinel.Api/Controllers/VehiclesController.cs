using Akinel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly IProductService _productService;

    public VehiclesController(IVehicleService vehicleService, IProductService productService)
    {
        _vehicleService = vehicleService;
        _productService = productService;
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

    [HttpPost("vin-decode")]
    public async Task<IActionResult> DecodeVin([FromBody] VinDecodeRequest request, CancellationToken ct)
    {
        var result = await _vehicleService.DecodeVinAsync(request.Vin, ct);
        return result == null ? NotFound(new { message = "Vehicle not found for this VIN." }) : Ok(result);
    }
}

public record VinDecodeRequest(string Vin);
