using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class ImportLog : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string ImportType { get; set; } = string.Empty; // "ProductImport" | "StockPriceUpdate"
    public string? AdminEmail { get; set; }
    public int TotalRows { get; set; }
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Unchanged { get; set; }
    public int Failed { get; set; }
    public int Skipped { get; set; }
    public string Status { get; set; } = "Pending"; // "Completed" | "Failed" | "PartialSuccess"
    public double DurationSeconds { get; set; }
    public string? ErrorSummary { get; set; } // JSON array of error strings
}
