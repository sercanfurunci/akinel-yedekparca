using Microsoft.AspNetCore.Http;

namespace Akinel.Application.Services;

public interface IStorageService
{
    Task<string> UploadAsync(IFormFile file, string folder, CancellationToken ct = default);
    Task DeleteAsync(string? fileUrl, CancellationToken ct = default);
}
