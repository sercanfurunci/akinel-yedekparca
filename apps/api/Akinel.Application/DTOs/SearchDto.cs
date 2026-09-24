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
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 24;

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
