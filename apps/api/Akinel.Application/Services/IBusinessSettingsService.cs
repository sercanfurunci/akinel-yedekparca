using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface IBusinessSettingsService
{
    Task<BusinessSettingsDto?> GetAsync(CancellationToken ct = default);
    Task<BusinessSettingsDto> UpdateAsync(UpdateBusinessSettingsRequest request, CancellationToken ct = default);
}
