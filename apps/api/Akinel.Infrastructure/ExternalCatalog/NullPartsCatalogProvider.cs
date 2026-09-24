using Akinel.Application.Contracts;
using Akinel.Application.Models;

namespace Akinel.Infrastructure.ExternalCatalog;

public class NullPartsCatalogProvider : IPartsCatalogProvider
{
    public Task<CatalogVehicleResult?> GetVehicleByVinAsync(string vin, CancellationToken cancellationToken = default)
        => Task.FromResult<CatalogVehicleResult?>(null);

    public Task<IEnumerable<CatalogPartResult>> SearchByOemNumberAsync(string oemNumber, CancellationToken cancellationToken = default)
        => Task.FromResult(Enumerable.Empty<CatalogPartResult>());

    public Task<IEnumerable<CatalogVehicleResult>> GetVehiclesByMakeModelAsync(string make, string model, CancellationToken cancellationToken = default)
        => Task.FromResult(Enumerable.Empty<CatalogVehicleResult>());

    public Task<IEnumerable<CatalogPartResult>> GetCompatiblePartsAsync(string vehicleId, CancellationToken cancellationToken = default)
        => Task.FromResult(Enumerable.Empty<CatalogPartResult>());
}
