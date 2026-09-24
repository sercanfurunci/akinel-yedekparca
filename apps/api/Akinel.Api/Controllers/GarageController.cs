using Akinel.Domain.Entities;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GarageController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public GarageController(AkinelDbContext db) => _db = db;

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetGarage(CancellationToken ct)
    {
        var userId = CurrentUserId;
        var vehicles = await _db.UserVehicles
            .Include(uv => uv.VehicleEngine)
                .ThenInclude(e => e.VehicleGeneration)
                    .ThenInclude(g => g.VehicleModel)
                        .ThenInclude(m => m.VehicleMake)
            .Where(uv => uv.UserId == userId)
            .OrderByDescending(uv => uv.IsDefault)
            .ThenBy(uv => uv.CreatedAt)
            .Select(uv => new
            {
                id = uv.Id,
                engineId = uv.VehicleEngineId,
                makeName = uv.VehicleEngine.VehicleGeneration.VehicleModel.VehicleMake.Name,
                modelName = uv.VehicleEngine.VehicleGeneration.VehicleModel.Name,
                generationName = uv.VehicleEngine.VehicleGeneration.Name,
                engineName = uv.VehicleEngine.Name,
                nickname = uv.Nickname,
                licensePlate = uv.LicensePlate,
                year = uv.Year,
                isDefault = uv.IsDefault,
            })
            .ToListAsync(ct);

        return Ok(vehicles);
    }

    [HttpPost]
    public async Task<IActionResult> AddVehicle([FromBody] AddGarageVehicleRequest request, CancellationToken ct)
    {
        var userId = CurrentUserId;

        var engine = await _db.VehicleEngines
            .Include(e => e.VehicleGeneration).ThenInclude(g => g.VehicleModel).ThenInclude(m => m.VehicleMake)
            .FirstOrDefaultAsync(e => e.Id == request.VehicleEngineId, ct);
        if (engine == null) return NotFound(new { message = "Motor bulunamadı." });

        // Check duplicate
        var exists = await _db.UserVehicles.AnyAsync(
            uv => uv.UserId == userId && uv.VehicleEngineId == request.VehicleEngineId, ct);
        if (exists) return Conflict(new { message = "Bu araç zaten garajınızda mevcut." });

        var noExisting = !await _db.UserVehicles.AnyAsync(uv => uv.UserId == userId, ct);

        var uv = new UserVehicle
        {
            UserId = userId,
            VehicleEngineId = request.VehicleEngineId,
            Nickname = request.Nickname,
            LicensePlate = request.LicensePlate,
            Year = request.Year,
            IsDefault = noExisting,
        };

        _db.UserVehicles.Add(uv);
        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            id = uv.Id,
            engineId = uv.VehicleEngineId,
            makeName = engine.VehicleGeneration.VehicleModel.VehicleMake.Name,
            modelName = engine.VehicleGeneration.VehicleModel.Name,
            generationName = engine.VehicleGeneration.Name,
            engineName = engine.Name,
            nickname = uv.Nickname,
            licensePlate = uv.LicensePlate,
            year = uv.Year,
            isDefault = uv.IsDefault,
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveVehicle(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserId;

        var uv = await _db.UserVehicles.FirstOrDefaultAsync(uv => uv.Id == id && uv.UserId == userId, ct);
        if (uv == null) return NotFound();

        _db.UserVehicles.Remove(uv);
        await _db.SaveChangesAsync(ct);

        // If deleted was default, promote next
        if (uv.IsDefault)
        {
            var next = await _db.UserVehicles.OrderBy(u => u.CreatedAt).FirstOrDefaultAsync(u => u.UserId == userId, ct);
            if (next != null) { next.IsDefault = true; await _db.SaveChangesAsync(ct); }
        }

        return NoContent();
    }

    [HttpPut("{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserId;

        var all = await _db.UserVehicles.Where(uv => uv.UserId == userId).ToListAsync(ct);
        foreach (var v in all) v.IsDefault = v.Id == id;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}

public record AddGarageVehicleRequest(Guid VehicleEngineId, string? Nickname, string? LicensePlate, int? Year);
