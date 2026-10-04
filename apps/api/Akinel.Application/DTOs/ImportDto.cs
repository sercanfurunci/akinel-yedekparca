namespace Akinel.Application.DTOs;

public enum ImportRowStatus { New, Update, Unchanged, Error, Duplicate }

// Stored in MemoryCache during preview
public class ParsedImportRow
{
    public int RowNumber { get; set; }
    public ImportRowStatus Status { get; set; }
    public string? Sku { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? PartNumber { get; set; }
    public Guid? BrandId { get; set; }
    public string? BrandName { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? Barcode { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
    public decimal? WeightKg { get; set; }
    public string? Dimensions { get; set; }
    public string? WarrantyInfo { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? ExistingProductId { get; set; }
    public List<string> Issues { get; set; } = new();
    public bool AllowOverwriteWithEmpty { get; set; }
}

public class CachedImportData
{
    public string ImportType { get; set; } = string.Empty;
    public bool AllowOverwriteWithEmpty { get; set; }
    public List<ParsedImportRow> Rows { get; set; } = new();
}

// API response DTOs
public class ImportRowPreviewDto
{
    public int RowNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? Name { get; set; }
    public string? BrandName { get; set; }
    public string? CategoryName { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
    public List<string> Issues { get; set; } = new();
}

public class ImportPreviewResponseDto
{
    public string PreviewToken { get; set; } = string.Empty;
    public int Total { get; set; }
    public int New { get; set; }
    public int Update { get; set; }
    public int Unchanged { get; set; }
    public int Error { get; set; }
    public int Duplicate { get; set; }
    // First 500 rows for display (errors first)
    public List<ImportRowPreviewDto> Rows { get; set; } = new();
}

public class ImportCommitRequest
{
    public string PreviewToken { get; set; } = string.Empty;
}

public class ImportResultDto
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Unchanged { get; set; }
    public int Failed { get; set; }
    public int Skipped { get; set; }
    public double DurationSeconds { get; set; }
    public List<string> Errors { get; set; } = new();
    public Guid? ImportLogId { get; set; }
}

public class ImportHistoryItemDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ImportType { get; set; } = string.Empty;
    public string? AdminEmail { get; set; }
    public int TotalRows { get; set; }
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Unchanged { get; set; }
    public int Failed { get; set; }
    public int Skipped { get; set; }
    public string Status { get; set; } = string.Empty;
    public double DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
}
