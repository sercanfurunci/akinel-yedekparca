using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface IProductService
{
    Task<PaginatedResult<ProductListItemDto>> GetProductsAsync(ProductSearchQuery query, CancellationToken ct = default);
    Task<ProductDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDto?> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ProductListItemDto>> GetByVehicleAsync(Guid engineId, int page = 1, int pageSize = 24, CancellationToken ct = default);
}
