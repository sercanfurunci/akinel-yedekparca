namespace Akinel.Application.DTOs;

public enum SearchQueryType
{
    FreeText,
    OemNumber,
    PartNumber,
    Brand
}

/// <summary>
/// Use a mutable class (not a positional record) so ASP.NET Core model binding
/// can set properties from query-string parameters.
/// </summary>
public class ProductSearchQuery
{
    public string? Query { get; set; }
    public SearchQueryType QueryType { get; set; } = SearchQueryType.FreeText;
    public Guid? CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public Guid? VehicleEngineId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool InStockOnly { get; set; } = true;
    public string SortBy { get; set; } = "relevance";
    public bool SortDescending { get; set; } = false;
    private int _page = 1;
    private int _pageSize = 24;

    public int Page
    {
        get => _page;
        set => _page = Math.Max(1, value);
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100);
    }

    // Copy constructor used in SearchService
    public ProductSearchQuery() { }

    public ProductSearchQuery(ProductSearchQuery other)
    {
        Query = other.Query;
        QueryType = other.QueryType;
        CategoryId = other.CategoryId;
        BrandId = other.BrandId;
        VehicleEngineId = other.VehicleEngineId;
        MinPrice = other.MinPrice;
        MaxPrice = other.MaxPrice;
        InStockOnly = other.InStockOnly;
        SortBy = other.SortBy;
        SortDescending = other.SortDescending;
        Page = other.Page;
        PageSize = other.PageSize;
    }
}
