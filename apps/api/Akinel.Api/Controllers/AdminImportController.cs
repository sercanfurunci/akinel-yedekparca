using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/admin/import")]
[Authorize(Roles = "Admin")]
public class AdminImportController : ControllerBase
{
    private const long MaxFileSizeBytes = 20 * 1024 * 1024; // 20 MB
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase) { ".xlsx", ".csv" };
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
        "text/plain",
        "application/octet-stream",
    };

    private readonly IBulkImportService _importService;

    public AdminImportController(IBulkImportService importService)
    {
        _importService = importService;
    }

    // ── Product Import ───────────────────────────────────────────────────

    /// <summary>Parse and preview a product import file. Returns a token for commit.</summary>
    [HttpPost("products/preview")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> PreviewProductImport(
        IFormFile file,
        [FromQuery] bool allowOverwriteWithEmpty = false,
        CancellationToken ct = default)
    {
        var validationError = ValidateFile(file);
        if (validationError != null) return BadRequest(new { message = validationError });

        try
        {
            var result = await _importService.PreviewProductImportAsync(file, allowOverwriteWithEmpty, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Commit a previously previewed product import.</summary>
    [HttpPost("products/commit")]
    public async Task<IActionResult> CommitProductImport(
        [FromBody] ImportCommitRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.PreviewToken))
            return BadRequest(new { message = "PreviewToken zorunludur." });

        var adminEmail = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "unknown";

        try
        {
            var result = await _importService.CommitProductImportAsync(request.PreviewToken, adminEmail, ct, request.Corrections);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Stock / Price Import ─────────────────────────────────────────────

    /// <summary>Parse and preview a stock/price update file. Returns a token for commit.</summary>
    [HttpPost("stock-price/preview")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> PreviewStockPriceImport(
        IFormFile file,
        CancellationToken ct = default)
    {
        var validationError = ValidateFile(file);
        if (validationError != null) return BadRequest(new { message = validationError });

        try
        {
            var result = await _importService.PreviewStockPriceImportAsync(file, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Commit a previously previewed stock/price import.</summary>
    [HttpPost("stock-price/commit")]
    public async Task<IActionResult> CommitStockPriceImport(
        [FromBody] ImportCommitRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.PreviewToken))
            return BadRequest(new { message = "PreviewToken zorunludur." });

        var adminEmail = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "unknown";

        try
        {
            var result = await _importService.CommitStockPriceImportAsync(request.PreviewToken, adminEmail, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── History ──────────────────────────────────────────────────────────

    /// <summary>Get the last 50 import log entries.</summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(CancellationToken ct = default)
    {
        var history = await _importService.GetHistoryAsync(50, ct);
        return Ok(history);
    }

    // ── Templates ────────────────────────────────────────────────────────

    /// <summary>Download the product import template as an .xlsx file.</summary>
    [HttpGet("template/products")]
    public IActionResult DownloadProductTemplate()
    {
        var bytes = _importService.GenerateProductTemplate();
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "urun-import-sablonu.xlsx");
    }

    /// <summary>Download the stock/price update template as an .xlsx file.</summary>
    [HttpGet("template/stock-price")]
    public IActionResult DownloadStockPriceTemplate()
    {
        var bytes = _importService.GenerateStockPriceTemplate();
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "stok-fiyat-guncelleme-sablonu.xlsx");
    }

    // ── Validation ───────────────────────────────────────────────────────

    private static string? ValidateFile(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return "Dosya zorunludur.";

        if (file.Length > MaxFileSizeBytes)
            return $"Dosya boyutu {MaxFileSizeBytes / 1024 / 1024}MB'dan büyük olamaz.";

        var ext = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(ext))
            return "Yalnızca .xlsx ve .csv dosyaları kabul edilir.";

        return null;
    }
}
