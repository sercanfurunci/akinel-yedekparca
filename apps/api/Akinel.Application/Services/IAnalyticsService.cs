using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface IAnalyticsService
{
    Task<AnalyticsResponseDto> GetAnalyticsAsync(string period, CancellationToken ct);
}
