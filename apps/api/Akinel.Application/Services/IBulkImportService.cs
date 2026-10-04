using Akinel.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace Akinel.Application.Services;

public interface IBulkImportService
{
    Task<ImportPreviewResponseDto> PreviewProductImportAsync(IFormFile file, bool allowOverwriteWithEmpty, CancellationToken ct);
    Task<ImportResultDto> CommitProductImportAsync(string token, string adminEmail, CancellationToken ct, IEnumerable<ImportRowCorrection>? corrections = null);
    Task<ImportPreviewResponseDto> PreviewStockPriceImportAsync(IFormFile file, CancellationToken ct);
    Task<ImportResultDto> CommitStockPriceImportAsync(string token, string adminEmail, CancellationToken ct);
    Task<List<ImportHistoryItemDto>> GetHistoryAsync(int limit, CancellationToken ct);
    byte[] GenerateProductTemplate();
    byte[] GenerateStockPriceTemplate();
}
