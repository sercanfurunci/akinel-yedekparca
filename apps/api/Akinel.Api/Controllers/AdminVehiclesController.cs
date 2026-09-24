using Akinel.Domain.Entities;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/admin/vehicles")]
[Authorize(Roles = "Admin")]
public class AdminVehiclesController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public AdminVehiclesController(AkinelDbContext db)
    {
        _db = db;
    }

    // ── Makes ─────────────────────────────────────────────────────────

    [HttpGet("makes")]
    public async Task<IActionResult> GetMakes(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var q = _db.VehicleMakes.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(m => m.Name.ToLower().Contains(search.ToLower()));

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderBy(m => m.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                m.Id,
                m.Name,
                m.Slug,
                m.IsActive,
                modelCount = _db.VehicleModels.Count(vm => vm.VehicleMakeId == m.Id)
            })
            .ToListAsync(ct);

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost("makes")]
    public async Task<IActionResult> CreateMake(
        [FromBody] CreateVehicleMakeRequest req,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Marka adı zorunludur." });

        var normalized = req.Name.Trim();
        var exists = await _db.VehicleMakes
            .AnyAsync(m => m.Name.ToLower() == normalized.ToLower(), ct);
        if (exists)
            return Conflict(new { message = $"'{normalized}' adında bir marka zaten mevcut." });

        var make = new VehicleMake
        {
            Name = normalized,
            Slug = GenerateSlug(normalized),
            IsActive = true
        };
        _db.VehicleMakes.Add(make);
        await _db.SaveChangesAsync(ct);
        return Ok(new { make.Id, make.Name, make.Slug, make.IsActive, modelCount = 0 });
    }

    [HttpPut("makes/{id:guid}")]
    public async Task<IActionResult> UpdateMake(
        Guid id,
        [FromBody] CreateVehicleMakeRequest req,
        CancellationToken ct)
    {
        var make = await _db.VehicleMakes.FindAsync(new object[] { id }, ct);
        if (make == null) return NotFound();

        var normalized = req.Name.Trim();
        var duplicate = await _db.VehicleMakes
            .AnyAsync(m => m.Id != id && m.Name.ToLower() == normalized.ToLower(), ct);
        if (duplicate)
            return Conflict(new { message = $"'{normalized}' adında bir marka zaten mevcut." });

        make.Name = normalized;
        make.Slug = GenerateSlug(normalized);
        await _db.SaveChangesAsync(ct);
        return Ok(new { make.Id, make.Name, make.Slug, make.IsActive });
    }

    [HttpDelete("makes/{id:guid}")]
    public async Task<IActionResult> DeleteMake(Guid id, CancellationToken ct)
    {
        var make = await _db.VehicleMakes.FindAsync(new object[] { id }, ct);
        if (make == null) return NotFound();

        var modelCount = await _db.VehicleModels
            .CountAsync(m => m.VehicleMakeId == id, ct);
        if (modelCount > 0)
            return Conflict(new { message = $"Bu markaya bağlı {modelCount} model bulunmaktadır. Silmek için önce modelleri kaldırın." });

        _db.VehicleMakes.Remove(make);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Models ────────────────────────────────────────────────────────

    [HttpGet("makes/{makeId:guid}/models")]
    public async Task<IActionResult> GetModels(
        Guid makeId,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var q = _db.VehicleModels.Where(m => m.VehicleMakeId == makeId);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(m => m.Name.ToLower().Contains(search.ToLower()));

        var items = await q
            .OrderBy(m => m.Name)
            .Select(m => new
            {
                m.Id,
                m.Name,
                m.VehicleMakeId,
                generationCount = _db.VehicleGenerations.Count(g => g.VehicleModelId == m.Id)
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPost("makes/{makeId:guid}/models")]
    public async Task<IActionResult> CreateModel(
        Guid makeId,
        [FromBody] CreateVehicleModelRequest req,
        CancellationToken ct)
    {
        var make = await _db.VehicleMakes.FindAsync(new object[] { makeId }, ct);
        if (make == null) return NotFound(new { message = "Marka bulunamadı." });

        var normalized = req.Name.Trim();
        var exists = await _db.VehicleModels
            .AnyAsync(m => m.VehicleMakeId == makeId && m.Name.ToLower() == normalized.ToLower(), ct);
        if (exists)
            return Conflict(new { message = $"Bu markada '{normalized}' adında bir model zaten mevcut." });

        var model = new VehicleModel
        {
            Name = normalized,
            Slug = GenerateSlug(normalized),
            VehicleMakeId = makeId
        };
        _db.VehicleModels.Add(model);
        await _db.SaveChangesAsync(ct);
        return Ok(new { model.Id, model.Name, model.VehicleMakeId, generationCount = 0 });
    }

    [HttpPut("models/{id:guid}")]
    public async Task<IActionResult> UpdateModel(
        Guid id,
        [FromBody] CreateVehicleModelRequest req,
        CancellationToken ct)
    {
        var model = await _db.VehicleModels.FindAsync(new object[] { id }, ct);
        if (model == null) return NotFound();

        var normalized = req.Name.Trim();
        var dup = await _db.VehicleModels
            .AnyAsync(m => m.Id != id && m.VehicleMakeId == model.VehicleMakeId && m.Name.ToLower() == normalized.ToLower(), ct);
        if (dup)
            return Conflict(new { message = $"Bu markada '{normalized}' adında bir model zaten mevcut." });

        model.Name = normalized;
        model.Slug = GenerateSlug(normalized);
        await _db.SaveChangesAsync(ct);
        return Ok(new { model.Id, model.Name, model.VehicleMakeId });
    }

    [HttpDelete("models/{id:guid}")]
    public async Task<IActionResult> DeleteModel(Guid id, CancellationToken ct)
    {
        var model = await _db.VehicleModels.FindAsync(new object[] { id }, ct);
        if (model == null) return NotFound();

        var genCount = await _db.VehicleGenerations
            .CountAsync(g => g.VehicleModelId == id, ct);
        if (genCount > 0)
            return Conflict(new { message = $"Bu modele bağlı {genCount} kasa/nesil bulunmaktadır. Silmek için önce bunları kaldırın." });

        _db.VehicleModels.Remove(model);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Generations ───────────────────────────────────────────────────

    [HttpGet("models/{modelId:guid}/generations")]
    public async Task<IActionResult> GetGenerations(Guid modelId, CancellationToken ct)
    {
        var items = await _db.VehicleGenerations
            .Where(g => g.VehicleModelId == modelId)
            .OrderBy(g => g.Name)
            .Select(g => new
            {
                g.Id,
                g.Name,
                g.YearFrom,
                g.YearTo,
                bodyType = g.BodyType,
                engineCount = _db.VehicleEngines.Count(e => e.VehicleGenerationId == g.Id)
            })
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("models/{modelId:guid}/generations")]
    public async Task<IActionResult> CreateGeneration(
        Guid modelId,
        [FromBody] CreateVehicleGenerationRequest req,
        CancellationToken ct)
    {
        var model = await _db.VehicleModels.FindAsync(new object[] { modelId }, ct);
        if (model == null) return NotFound(new { message = "Model bulunamadı." });

        var normalized = req.Name.Trim();
        var exists = await _db.VehicleGenerations
            .AnyAsync(g => g.VehicleModelId == modelId && g.Name.ToLower() == normalized.ToLower(), ct);
        if (exists)
            return Conflict(new { message = $"Bu modelde '{normalized}' adında bir kasa/nesil zaten mevcut." });

        var gen = new VehicleGeneration
        {
            Name = normalized,
            Slug = GenerateSlug(normalized),
            VehicleModelId = modelId,
            BodyType = req.BodyType?.Trim(),
            YearFrom = req.YearFrom,
            YearTo = req.YearTo
        };
        _db.VehicleGenerations.Add(gen);
        await _db.SaveChangesAsync(ct);
        return Ok(new { gen.Id, gen.Name, gen.YearFrom, gen.YearTo, bodyType = gen.BodyType, engineCount = 0 });
    }

    [HttpPut("generations/{id:guid}")]
    public async Task<IActionResult> UpdateGeneration(
        Guid id,
        [FromBody] CreateVehicleGenerationRequest req,
        CancellationToken ct)
    {
        var gen = await _db.VehicleGenerations.FindAsync(new object[] { id }, ct);
        if (gen == null) return NotFound();

        gen.Name = req.Name.Trim();
        gen.Slug = GenerateSlug(req.Name.Trim());
        gen.BodyType = req.BodyType?.Trim();
        gen.YearFrom = req.YearFrom;
        gen.YearTo = req.YearTo;
        await _db.SaveChangesAsync(ct);
        return Ok(new { gen.Id, gen.Name, gen.YearFrom, gen.YearTo, bodyType = gen.BodyType });
    }

    [HttpDelete("generations/{id:guid}")]
    public async Task<IActionResult> DeleteGeneration(Guid id, CancellationToken ct)
    {
        var gen = await _db.VehicleGenerations.FindAsync(new object[] { id }, ct);
        if (gen == null) return NotFound();

        var engineCount = await _db.VehicleEngines
            .CountAsync(e => e.VehicleGenerationId == id, ct);
        if (engineCount > 0)
            return Conflict(new { message = $"Bu nesle bağlı {engineCount} motor/varyant bulunmaktadır. Silmek için önce bunları kaldırın." });

        _db.VehicleGenerations.Remove(gen);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Engines ───────────────────────────────────────────────────────

    [HttpGet("generations/{generationId:guid}/engines")]
    public async Task<IActionResult> GetEngines(Guid generationId, CancellationToken ct)
    {
        var items = await _db.VehicleEngines
            .Where(e => e.VehicleGenerationId == generationId)
            .OrderBy(e => e.Name)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.FuelType,
                e.PowerHp,
                e.PowerKw,
                e.DisplacementCc,
                e.Displacement,
                e.Gearbox,
                e.Drivetrain,
                e.EngineCode,
                e.YearFrom,
                e.YearTo,
                compatCount = _db.ProductVehicleCompatibilities.Count(c => c.VehicleEngineId == e.Id)
            })
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("generations/{generationId:guid}/engines")]
    public async Task<IActionResult> CreateEngine(
        Guid generationId,
        [FromBody] CreateVehicleEngineRequest req,
        CancellationToken ct)
    {
        var gen = await _db.VehicleGenerations.FindAsync(new object[] { generationId }, ct);
        if (gen == null) return NotFound(new { message = "Nesil bulunamadı." });

        var normalized = req.Name.Trim();
        var exists = await _db.VehicleEngines
            .AnyAsync(e => e.VehicleGenerationId == generationId && e.Name.ToLower() == normalized.ToLower(), ct);
        if (exists)
            return Conflict(new { message = $"Bu nesilde '{normalized}' adında bir motor zaten mevcut." });

        var engine = new VehicleEngine
        {
            Name = normalized,
            VehicleGenerationId = generationId,
            FuelType = req.FuelType?.Trim(),
            PowerHp = req.PowerHp,
            DisplacementCc = req.DisplacementCc,
            Displacement = req.Displacement?.Trim(),
            Gearbox = req.Gearbox?.Trim(),
            Drivetrain = req.Drivetrain?.Trim(),
            EngineCode = req.EngineCode?.Trim(),
            YearFrom = req.YearFrom,
            YearTo = req.YearTo,
        };
        _db.VehicleEngines.Add(engine);
        await _db.SaveChangesAsync(ct);
        return Ok(new
        {
            engine.Id, engine.Name, engine.FuelType, engine.PowerHp, engine.PowerKw,
            engine.DisplacementCc, engine.Displacement, engine.Gearbox, engine.Drivetrain,
            engine.EngineCode, engine.YearFrom, engine.YearTo, compatCount = 0
        });
    }

    [HttpPut("engines/{id:guid}")]
    public async Task<IActionResult> UpdateEngine(
        Guid id,
        [FromBody] CreateVehicleEngineRequest req,
        CancellationToken ct)
    {
        var engine = await _db.VehicleEngines.FindAsync(new object[] { id }, ct);
        if (engine == null) return NotFound();

        engine.Name = req.Name.Trim();
        engine.FuelType = req.FuelType?.Trim();
        engine.PowerHp = req.PowerHp;
        engine.DisplacementCc = req.DisplacementCc;
        engine.Displacement = req.Displacement?.Trim();
        engine.Gearbox = req.Gearbox?.Trim();
        engine.Drivetrain = req.Drivetrain?.Trim();
        engine.EngineCode = req.EngineCode?.Trim();
        engine.YearFrom = req.YearFrom;
        engine.YearTo = req.YearTo;
        await _db.SaveChangesAsync(ct);
        return Ok(new
        {
            engine.Id, engine.Name, engine.FuelType, engine.PowerHp, engine.PowerKw,
            engine.DisplacementCc, engine.Displacement, engine.Gearbox, engine.Drivetrain,
            engine.EngineCode, engine.YearFrom, engine.YearTo
        });
    }

    [HttpDelete("engines/{id:guid}")]
    public async Task<IActionResult> DeleteEngine(Guid id, CancellationToken ct)
    {
        var engine = await _db.VehicleEngines.FindAsync(new object[] { id }, ct);
        if (engine == null) return NotFound();

        var compatCount = await _db.ProductVehicleCompatibilities
            .CountAsync(c => c.VehicleEngineId == id, ct);
        if (compatCount > 0)
            return Conflict(new { message = $"Bu motor {compatCount} ürün uyumluluk kaydında kullanılmaktadır. Silmek için önce ürün uyumluluk kayıtlarını kaldırın." });

        _db.VehicleEngines.Remove(engine);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Search ────────────────────────────────────────────────────────

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new { makes = Array.Empty<object>(), models = Array.Empty<object>(), engines = Array.Empty<object>() });

        var lower = q.ToLower();

        var makes = await _db.VehicleMakes
            .Where(m => m.Name.ToLower().Contains(lower))
            .Take(10)
            .Select(m => new { m.Id, m.Name, type = "make" })
            .ToListAsync(ct);

        var models = await _db.VehicleModels
            .Include(m => m.VehicleMake)
            .Where(m => m.Name.ToLower().Contains(lower))
            .Take(10)
            .Select(m => new { m.Id, m.Name, makeName = m.VehicleMake.Name, makeId = m.VehicleMakeId, type = "model" })
            .ToListAsync(ct);

        var engines = await _db.VehicleEngines
            .Include(e => e.VehicleGeneration)
                .ThenInclude(g => g.VehicleModel)
                    .ThenInclude(m => m.VehicleMake)
            .Where(e => e.Name.ToLower().Contains(lower))
            .Take(10)
            .Select(e => new
            {
                e.Id,
                e.Name,
                path = e.VehicleGeneration.VehicleModel.VehicleMake.Name + " > " +
                       e.VehicleGeneration.VehicleModel.Name + " > " +
                       e.VehicleGeneration.Name,
                makeId = e.VehicleGeneration.VehicleModel.VehicleMakeId,
                type = "engine"
            })
            .ToListAsync(ct);

        return Ok(new { makes, models, engines });
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Replace(" ", "-");
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = Regex.Replace(slug, @"-{2,}", "-");
        return slug.Trim('-');
    }
}

// ── Request Records ───────────────────────────────────────────────────────────
public record CreateVehicleMakeRequest(string Name);
public record CreateVehicleModelRequest(string Name);
public record CreateVehicleGenerationRequest(string Name, string? BodyType, int? YearFrom, int? YearTo);
public record CreateVehicleEngineRequest(
    string Name,
    string? FuelType,
    int? PowerHp,
    int? DisplacementCc,
    string? Displacement,
    string? Gearbox,
    string? Drivetrain,
    string? EngineCode,
    int? YearFrom,
    int? YearTo);
