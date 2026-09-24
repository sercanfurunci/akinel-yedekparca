using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface ISearchService
{
    Task<PaginatedResult<ProductListItemDto>> SearchAsync(ProductSearchQuery query, CancellationToken ct = default);
    Task<IEnumerable<string>> GetSuggestionsAsync(string query, int limit = 10, CancellationToken ct = default);
}
