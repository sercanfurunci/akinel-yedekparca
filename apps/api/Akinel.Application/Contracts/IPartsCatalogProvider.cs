using Akinel.Application.Models;

namespace Akinel.Application.Contracts;

public interface IPartsCatalogProvider
{
    Task<CatalogVehicleResult?> GetVehicleByVinAsync(string vin, CancellationToken cancellationToken = default);
    Task<IEnumerable<CatalogPartResult>> SearchByOemNumberAsync(string oemNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<CatalogVehicleResult>> GetVehiclesByMakeModelAsync(string make, string model, CancellationToken cancellationToken = default);
    Task<IEnumerable<CatalogPartResult>> GetCompatiblePartsAsync(string vehicleId, CancellationToken cancellationToken = default);
}
