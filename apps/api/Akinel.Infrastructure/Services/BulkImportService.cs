using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Infrastructure.Data;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Akinel.Infrastructure.Services;

public class BulkImportService : IBulkImportService
{
    private readonly AkinelDbContext _db;
    private readonly IMemoryCache _cache;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

    // Column header aliases → canonical field name
    private static readonly Dictionary<string, string> ColumnAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        // SKU
        ["sku"] = "Sku",
        ["stok kodu"] = "Sku",
        ["stok_kodu"] = "Sku",
        ["stock code"] = "Sku",
        ["stock_code"] = "Sku",
        ["urun kodu"] = "Sku",
        ["urun_kodu"] = "Sku",
        ["urunkodu"] = "Sku",
        ["kod"] = "Sku",
        // Name
        ["urun adi"] = "Name",
        ["urun_adi"] = "Name",
        ["urunadi"] = "Name",
        ["product name"] = "Name",
        ["product_name"] = "Name",
        ["name"] = "Name",
        ["ad"] = "Name",
        ["adi"] = "Name",
        // Description
        ["aciklama"] = "Description",
        ["tanim"] = "Description",
        ["description"] = "Description",
        // Brand
        ["marka"] = "Brand",
        ["brand"] = "Brand",
        ["marka adi"] = "Brand",
        ["marka_adi"] = "Brand",
        // Category
        ["kategori"] = "Category",
        ["category"] = "Category",
        ["kategori adi"] = "Category",
        ["kategori_adi"] = "Category",
        // Barcode
        ["barkod"] = "Barcode",
        ["barcode"] = "Barcode",
        ["ean"] = "Barcode",
        ["ean13"] = "Barcode",
        // Price
        ["fiyat"] = "Price",
        ["price"] = "Price",
        ["satis fiyati"] = "Price",
        ["satis_fiyati"] = "Price",
        ["fiyat tl"] = "Price",
        ["fiyat_tl"] = "Price",
        // Stock
        ["stok"] = "Stock",
        ["stock"] = "Stock",
        ["quantity"] = "Stock",
        ["miktar"] = "Stock",
        ["adet"] = "Stock",
        ["stok miktari"] = "Stock",
        ["stok_miktari"] = "Stock",
        // Weight
        ["agirlik"] = "WeightKg",
        ["weight"] = "WeightKg",
        ["agirlik kg"] = "WeightKg",
        ["agirlik_kg"] = "WeightKg",
        // Dimensions
        ["boyutlar"] = "Dimensions",
        ["olculer"] = "Dimensions",
        ["dimensions"] = "Dimensions",
        // Warranty
        ["garanti"] = "WarrantyInfo",
        ["warranty"] = "WarrantyInfo",
        ["garanti bilgisi"] = "WarrantyInfo",
        ["garanti_bilgisi"] = "WarrantyInfo",
        // IsActive
        ["aktif"] = "IsActive",
        ["active"] = "IsActive",
        ["durum"] = "IsActive",
        // PartNumber
        ["parca no"] = "PartNumber",
        ["parca_no"] = "PartNumber",
        ["part number"] = "PartNumber",
        ["part_number"] = "PartNumber",
        ["parca numarasi"] = "PartNumber",
        ["parca_numarasi"] = "PartNumber",
    };

    public BulkImportService(AkinelDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    // ── Public interface ─────────────────────────────────────────────────

    public async Task<ImportPreviewResponseDto> PreviewProductImportAsync(IFormFile file, bool allowOverwriteWithEmpty, CancellationToken ct)
    {
        var rows = await ParseFileAsync(file, ct);

        // Load lookup data
        var brands = await LoadBrandsAsync(ct);
        var categories = await LoadCategoriesAsync(ct);
        var existingSkus = await LoadExistingSkusAsync(ct);

        var seenSkus = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var parsedRows = new List<ParsedImportRow>();

        foreach (var raw in rows)
        {
            var row = new ParsedImportRow
            {
                RowNumber = raw.RowNumber,
                AllowOverwriteWithEmpty = allowOverwriteWithEmpty,
            };

            // Map raw dict values to ParsedImportRow
            MapRawRow(raw.Cells, row);

            // Duplicate SKU detection within this file
            if (!string.IsNullOrWhiteSpace(row.Sku))
            {
                if (!seenSkus.Add(row.Sku))
                {
                    row.Status = ImportRowStatus.Duplicate;
                    row.Issues.Add($"Bu SKU dosyada birden fazla kez geçiyor: {row.Sku}");
                    parsedRows.Add(row);
                    continue;
                }
            }

            // Resolve brand
            if (!string.IsNullOrWhiteSpace(row.BrandName))
            {
                var normalizedBrand = NormalizeForLookup(row.BrandName);
                if (brands.TryGetValue(normalizedBrand, out var brandId))
                    row.BrandId = brandId;
                else
                    row.Issues.Add($"Marka bulunamadı: '{row.BrandName}'");
            }

            // Resolve category
            if (!string.IsNullOrWhiteSpace(row.CategoryName))
            {
                var normalizedCat = NormalizeForLookup(row.CategoryName);
                if (categories.TryGetValue(normalizedCat, out var catId))
                    row.CategoryId = catId;
                else
                    row.Issues.Add($"Kategori bulunamadı: '{row.CategoryName}'");
            }

            // Determine status: New / Update / Unchanged
            if (!string.IsNullOrWhiteSpace(row.Sku) && existingSkus.TryGetValue(row.Sku, out var existing))
            {
                row.ExistingProductId = existing.Id;

                // Check if anything would actually change
                bool priceChanged = row.Price.HasValue && row.Price.Value != existing.Price;
                bool stockChanged = row.Stock.HasValue && row.Stock.Value != existing.StockQty;
                bool nameChanged = !string.IsNullOrWhiteSpace(row.Name) && !row.Name.Equals(existing.Name, StringComparison.OrdinalIgnoreCase);
                bool activeChanged = row.IsActive != existing.IsActive;

                if (!priceChanged && !stockChanged && !nameChanged && !activeChanged)
                    row.Status = ImportRowStatus.Unchanged;
                else
                    row.Status = ImportRowStatus.Update;
            }
            else
            {
                row.Status = ImportRowStatus.New;
            }

            // Validate for new products
            if (row.Status == ImportRowStatus.New)
            {
                if (string.IsNullOrWhiteSpace(row.Name))
                    row.Issues.Add("Ürün adı zorunludur.");
                if (!row.Price.HasValue || row.Price.Value <= 0)
                    row.Issues.Add("Fiyat zorunludur ve sıfırdan büyük olmalıdır.");
                if (!row.BrandId.HasValue && !string.IsNullOrWhiteSpace(row.BrandName))
                    { /* already added issue above */ }
                else if (!row.BrandId.HasValue)
                    row.Issues.Add("Marka zorunludur.");
                if (!row.CategoryId.HasValue && !string.IsNullOrWhiteSpace(row.CategoryName))
                    { /* already added issue above */ }
                else if (!row.CategoryId.HasValue)
                    row.Issues.Add("Kategori zorunludur.");
            }

            if (row.Issues.Count > 0 && row.Status != ImportRowStatus.Unchanged)
                row.Status = ImportRowStatus.Error;

            parsedRows.Add(row);
        }

        return BuildPreviewResponse(parsedRows, "ProductImport", allowOverwriteWithEmpty);
    }

    public async Task<ImportResultDto> CommitProductImportAsync(string token, string adminEmail, CancellationToken ct)
    {
        if (!_cache.TryGetValue<CachedImportData>(token, out var cached) || cached == null)
            throw new InvalidOperationException("Önizleme verisi bulunamadı veya süresi doldu. Lütfen tekrar yükleyin.");

        var sw = System.Diagnostics.Stopwatch.StartNew();
        var errors = new List<string>();
        int created = 0, updated = 0, unchanged = 0, failed = 0, skipped = 0;

        var existingSlugs = await _db.Products.AsNoTracking().Select(p => p.Slug).ToHashSetAsync(ct);

        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            var newProducts = new List<Product>();
            var batchCount = 0;

            foreach (var row in cached.Rows)
            {
                if (row.Status == ImportRowStatus.Duplicate || row.Status == ImportRowStatus.Error)
                {
                    skipped++;
                    continue;
                }
                if (row.Status == ImportRowStatus.Unchanged)
                {
                    unchanged++;
                    continue;
                }

                try
                {
                    if (row.Status == ImportRowStatus.New)
                    {
                        if (!row.BrandId.HasValue || !row.CategoryId.HasValue || string.IsNullOrWhiteSpace(row.Name))
                        {
                            errors.Add($"Satır {row.RowNumber}: Zorunlu alanlar eksik, atlandı.");
                            failed++;
                            continue;
                        }

                        var slug = GenerateUniqueSlug(row.Name, existingSlugs);
                        existingSlugs.Add(slug);

                        var product = new Product
                        {
                            Name = row.Name,
                            Slug = slug,
                            Description = row.Description,
                            BrandId = row.BrandId!.Value,
                            CategoryId = row.CategoryId!.Value,
                            PartNumber = row.PartNumber,
                            SKU = row.Sku,
                            Price = row.Price ?? 0m,
                            IsActive = row.IsActive,
                            Barcode = row.Barcode,
                            WeightKg = row.WeightKg,
                            WarrantyInfo = row.WarrantyInfo,
                        };

                        ParseDimensions(row.Dimensions, product);

                        newProducts.Add(product);
                        batchCount++;

                        // Add stock record placeholder — will be associated after SaveChanges
                        if (batchCount % 500 == 0)
                        {
                            _db.Products.AddRange(newProducts);
                            await _db.SaveChangesAsync(ct);
                            // Create stock records
                            await CreateStockRecordsAsync(newProducts, cached.Rows, ct);
                            created += newProducts.Count;
                            newProducts.Clear();
                        }
                    }
                    else if (row.Status == ImportRowStatus.Update && row.ExistingProductId.HasValue)
                    {
                        var product = await _db.Products
                            .Include(p => p.Stock)
                            .FirstOrDefaultAsync(p => p.Id == row.ExistingProductId.Value, ct);

                        if (product == null)
                        {
                            errors.Add($"Satır {row.RowNumber}: Ürün veritabanında bulunamadı (ID: {row.ExistingProductId}).");
                            failed++;
                            continue;
                        }

                        bool overwrite = cached.AllowOverwriteWithEmpty;

                        if (!string.IsNullOrWhiteSpace(row.Name)) product.Name = row.Name;
                        if (!string.IsNullOrWhiteSpace(row.Description) || overwrite) product.Description = row.Description;
                        if (row.BrandId.HasValue) product.BrandId = row.BrandId.Value;
                        if (row.CategoryId.HasValue) product.CategoryId = row.CategoryId.Value;
                        if (!string.IsNullOrWhiteSpace(row.PartNumber) || overwrite) product.PartNumber = row.PartNumber;
                        if (!string.IsNullOrWhiteSpace(row.Barcode) || overwrite) product.Barcode = row.Barcode;
                        if (row.Price.HasValue && row.Price.Value > 0) product.Price = row.Price.Value;
                        if (row.WeightKg.HasValue) product.WeightKg = row.WeightKg;
                        if (!string.IsNullOrWhiteSpace(row.WarrantyInfo) || overwrite) product.WarrantyInfo = row.WarrantyInfo;
                        if (!string.IsNullOrWhiteSpace(row.Dimensions)) ParseDimensions(row.Dimensions, product);
                        product.IsActive = row.IsActive;

                        if (row.Stock.HasValue)
                        {
                            if (product.Stock != null)
                            {
                                product.Stock.Quantity = row.Stock.Value;
                                product.Stock.UpdatedAt = DateTime.UtcNow;
                            }
                            else
                            {
                                _db.Stocks.Add(new Stock
                                {
                                    ProductId = product.Id,
                                    Quantity = row.Stock.Value,
                                    ReservedQuantity = 0,
                                    MinimumStockLevel = 0,
                                    UpdatedAt = DateTime.UtcNow
                                });
                            }
                        }

                        updated++;
                        batchCount++;

                        if (batchCount % 500 == 0)
                            await _db.SaveChangesAsync(ct);
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"Satır {row.RowNumber}: {ex.Message}");
                    failed++;
                }
            }

            // Process remaining new products
            if (newProducts.Count > 0)
            {
                _db.Products.AddRange(newProducts);
                await _db.SaveChangesAsync(ct);
                await CreateStockRecordsAsync(newProducts, cached.Rows, ct);
                created += newProducts.Count;
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            throw new InvalidOperationException($"İçe aktarma sırasında kritik hata oluştu: {ex.Message}", ex);
        }

        sw.Stop();
        _cache.Remove(token);

        // Log the import
        var log = new ImportLog
        {
            FileName = cached.ImportType,
            ImportType = "ProductImport",
            AdminEmail = adminEmail,
            TotalRows = cached.Rows.Count,
            Created = created,
            Updated = updated,
            Unchanged = unchanged,
            Failed = failed,
            Skipped = skipped,
            Status = failed == 0 ? "Completed" : (created + updated > 0 ? "PartialSuccess" : "Failed"),
            DurationSeconds = sw.Elapsed.TotalSeconds,
            ErrorSummary = errors.Count > 0 ? JsonSerializer.Serialize(errors.Take(100)) : null,
        };
        _db.ImportLogs.Add(log);
        await _db.SaveChangesAsync(CancellationToken.None);

        return new ImportResultDto
        {
            Created = created,
            Updated = updated,
            Unchanged = unchanged,
            Failed = failed,
            Skipped = skipped,
            DurationSeconds = sw.Elapsed.TotalSeconds,
            Errors = errors,
            ImportLogId = log.Id,
        };
    }

    public async Task<ImportPreviewResponseDto> PreviewStockPriceImportAsync(IFormFile file, CancellationToken ct)
    {
        var rows = await ParseFileAsync(file, ct);
        var existingSkus = await LoadExistingSkusAsync(ct);

        var parsedRows = new List<ParsedImportRow>();
        var seenSkus = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var raw in rows)
        {
            var row = new ParsedImportRow { RowNumber = raw.RowNumber };

            // For stock/price we only need SKU, Stock, Price
            if (raw.Cells.TryGetValue("Sku", out var skuVal)) row.Sku = skuVal?.Trim();
            if (raw.Cells.TryGetValue("Stock", out var stockVal) && !string.IsNullOrWhiteSpace(stockVal))
                row.Stock = ParseStock(stockVal, row.Issues, raw.RowNumber);
            if (raw.Cells.TryGetValue("Price", out var priceVal) && !string.IsNullOrWhiteSpace(priceVal))
                row.Price = ParsePrice(priceVal, row.Issues, raw.RowNumber);

            if (string.IsNullOrWhiteSpace(row.Sku))
            {
                row.Issues.Add("SKU zorunludur.");
                row.Status = ImportRowStatus.Error;
                parsedRows.Add(row);
                continue;
            }

            if (!seenSkus.Add(row.Sku))
            {
                row.Status = ImportRowStatus.Duplicate;
                row.Issues.Add($"Bu SKU dosyada birden fazla kez geçiyor: {row.Sku}");
                parsedRows.Add(row);
                continue;
            }

            if (!existingSkus.TryGetValue(row.Sku, out var existing))
            {
                row.Issues.Add($"SKU veritabanında bulunamadı: {row.Sku}");
                row.Status = ImportRowStatus.Error;
                parsedRows.Add(row);
                continue;
            }

            row.ExistingProductId = existing.Id;

            bool priceChanged = row.Price.HasValue && row.Price.Value > 0 && row.Price.Value != existing.Price;
            bool stockChanged = row.Stock.HasValue && row.Stock.Value >= 0 && row.Stock.Value != existing.StockQty;

            row.Status = (priceChanged || stockChanged) ? ImportRowStatus.Update : ImportRowStatus.Unchanged;
            parsedRows.Add(row);
        }

        return BuildPreviewResponse(parsedRows, "StockPriceUpdate", false);
    }

    public async Task<ImportResultDto> CommitStockPriceImportAsync(string token, string adminEmail, CancellationToken ct)
    {
        if (!_cache.TryGetValue<CachedImportData>(token, out var cached) || cached == null)
            throw new InvalidOperationException("Önizleme verisi bulunamadı veya süresi doldu. Lütfen tekrar yükleyin.");

        var sw = System.Diagnostics.Stopwatch.StartNew();
        var errors = new List<string>();
        int updated = 0, unchanged = 0, failed = 0, skipped = 0;

        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            int batchCount = 0;
            foreach (var row in cached.Rows)
            {
                if (row.Status == ImportRowStatus.Unchanged) { unchanged++; continue; }
                if (row.Status != ImportRowStatus.Update) { skipped++; continue; }

                try
                {
                    var product = await _db.Products
                        .Include(p => p.Stock)
                        .FirstOrDefaultAsync(p => p.Id == row.ExistingProductId!.Value, ct);

                    if (product == null)
                    {
                        errors.Add($"Satır {row.RowNumber}: Ürün bulunamadı.");
                        failed++;
                        continue;
                    }

                    if (row.Price.HasValue && row.Price.Value > 0)
                        product.Price = row.Price.Value;

                    if (row.Stock.HasValue && row.Stock.Value >= 0)
                    {
                        if (product.Stock != null)
                        {
                            product.Stock.Quantity = row.Stock.Value;
                            product.Stock.UpdatedAt = DateTime.UtcNow;
                        }
                        else
                        {
                            _db.Stocks.Add(new Stock
                            {
                                ProductId = product.Id,
                                Quantity = row.Stock.Value,
                                ReservedQuantity = 0,
                                MinimumStockLevel = 0,
                                UpdatedAt = DateTime.UtcNow,
                            });
                        }
                    }

                    updated++;
                    batchCount++;
                    if (batchCount % 500 == 0)
                        await _db.SaveChangesAsync(ct);
                }
                catch (Exception ex)
                {
                    errors.Add($"Satır {row.RowNumber}: {ex.Message}");
                    failed++;
                }
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            throw new InvalidOperationException($"İçe aktarma sırasında kritik hata oluştu: {ex.Message}", ex);
        }

        sw.Stop();
        _cache.Remove(token);

        var log = new ImportLog
        {
            FileName = cached.ImportType,
            ImportType = "StockPriceUpdate",
            AdminEmail = adminEmail,
            TotalRows = cached.Rows.Count,
            Created = 0,
            Updated = updated,
            Unchanged = unchanged,
            Failed = failed,
            Skipped = skipped,
            Status = failed == 0 ? "Completed" : (updated > 0 ? "PartialSuccess" : "Failed"),
            DurationSeconds = sw.Elapsed.TotalSeconds,
            ErrorSummary = errors.Count > 0 ? JsonSerializer.Serialize(errors.Take(100)) : null,
        };
        _db.ImportLogs.Add(log);
        await _db.SaveChangesAsync(CancellationToken.None);

        return new ImportResultDto
        {
            Created = 0,
            Updated = updated,
            Unchanged = unchanged,
            Failed = failed,
            Skipped = skipped,
            DurationSeconds = sw.Elapsed.TotalSeconds,
            Errors = errors,
            ImportLogId = log.Id,
        };
    }

    public async Task<List<ImportHistoryItemDto>> GetHistoryAsync(int limit, CancellationToken ct)
    {
        return await _db.ImportLogs
            .AsNoTracking()
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .Select(l => new ImportHistoryItemDto
            {
                Id = l.Id,
                FileName = l.FileName,
                ImportType = l.ImportType,
                AdminEmail = l.AdminEmail,
                TotalRows = l.TotalRows,
                Created = l.Created,
                Updated = l.Updated,
                Unchanged = l.Unchanged,
                Failed = l.Failed,
                Skipped = l.Skipped,
                Status = l.Status,
                DurationSeconds = l.DurationSeconds,
                CreatedAt = l.CreatedAt,
            })
            .ToListAsync(ct);
    }

    public byte[] GenerateProductTemplate()
    {
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Ürünler");

        string[] headers = {
            "SKU", "Ürün Adı", "Açıklama", "Marka", "Kategori",
            "Barkod", "Fiyat", "Stok",
            "Ağırlık (kg)", "Boyutlar", "Garanti", "Aktif"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#4472C4");
            cell.Style.Font.FontColor = XLColor.White;
        }

        // Example row
        ws.Cell(2, 1).Value = "YK-001";
        ws.Cell(2, 2).Value = "Yağ Filtresi";
        ws.Cell(2, 3).Value = "Yüksek kaliteli yağ filtresi";
        ws.Cell(2, 4).Value = "Bosch";
        ws.Cell(2, 5).Value = "Filtreler";
        ws.Cell(2, 6).Value = "8699999000016";
        ws.Cell(2, 7).Value = "125,00";
        ws.Cell(2, 8).Value = 50;
        ws.Cell(2, 9).Value = "0.35";
        ws.Cell(2, 10).Value = "10x8x8";
        ws.Cell(2, 11).Value = "2 yıl";
        ws.Cell(2, 12).Value = "1";

        ws.Columns().AdjustToContents();

        // Instructions sheet
        var ws2 = wb.AddWorksheet("Açıklamalar");
        ws2.Cell(1, 1).Value = "ÜRÜN İÇE AKTARMA - ALAN AÇIKLAMALARI";
        ws2.Cell(1, 1).Style.Font.Bold = true;
        ws2.Cell(1, 1).Style.Font.FontSize = 14;

        var instructions = new[]
        {
            ("SKU",         "Stok kodu. Boş bırakılabilir ancak güncelleme için zorunludur."),
            ("Ürün Adı",    "Zorunlu. Ürünün tam adı."),
            ("Açıklama",    "İsteğe bağlı. Ürün açıklaması."),
            ("Marka",       "Zorunlu. Sistemde kayıtlı marka adı (büyük/küçük harf duyarsız)."),
            ("Kategori",    "Zorunlu. Sistemde kayıtlı kategori adı (büyük/küçük harf duyarsız)."),
            ("Barkod",      "İsteğe bağlı. EAN/barkod numarası."),
            ("Fiyat",       "Zorunlu. Türk ve İngiliz formatı desteklenir: 1.290,50 veya 1290.50 veya 1290"),
            ("Stok",        "İsteğe bağlı. Tam sayı, 0 veya pozitif."),
            ("Ağırlık (kg)","İsteğe bağlı. Kilogram cinsinden ağırlık."),
            ("Boyutlar",    "İsteğe bağlı. GENİŞLİKxYÜKSEKLİKxDERİNLİK formatında (örn: 10x5x3)."),
            ("Garanti",     "İsteğe bağlı. Garanti bilgisi."),
            ("Aktif",       "İsteğe bağlı. 1/true/evet = aktif, 0/false/hayır = pasif. Varsayılan: 1"),
        };

        for (int i = 0; i < instructions.Length; i++)
        {
            ws2.Cell(i + 3, 1).Value = instructions[i].Item1;
            ws2.Cell(i + 3, 1).Style.Font.Bold = true;
            ws2.Cell(i + 3, 2).Value = instructions[i].Item2;
        }
        ws2.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public byte[] GenerateStockPriceTemplate()
    {
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Stok ve Fiyat");

        string[] headers = { "SKU", "Stok", "Fiyat" };
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#4472C4");
            cell.Style.Font.FontColor = XLColor.White;
        }

        ws.Cell(2, 1).Value = "YK-001";
        ws.Cell(2, 2).Value = 50;
        ws.Cell(2, 3).Value = "125,00";

        ws.Columns().AdjustToContents();

        var ws2 = wb.AddWorksheet("Açıklamalar");
        ws2.Cell(1, 1).Value = "STOK/FİYAT GÜNCELLEME - ALAN AÇIKLAMALARI";
        ws2.Cell(1, 1).Style.Font.Bold = true;
        ws2.Cell(1, 1).Style.Font.FontSize = 14;

        ws2.Cell(3, 1).Value = "SKU";
        ws2.Cell(3, 1).Style.Font.Bold = true;
        ws2.Cell(3, 2).Value = "Zorunlu. Sistemde kayıtlı ürün SKU kodu.";
        ws2.Cell(4, 1).Value = "Stok";
        ws2.Cell(4, 1).Style.Font.Bold = true;
        ws2.Cell(4, 2).Value = "Tam sayı, 0 veya pozitif. Boş bırakılırsa stok güncellenmez.";
        ws2.Cell(5, 1).Value = "Fiyat";
        ws2.Cell(5, 1).Style.Font.Bold = true;
        ws2.Cell(5, 2).Value = "Türk formatı desteklenir: 1.290,50 veya 1290.50. Boş bırakılırsa fiyat güncellenmez.";

        ws2.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private record RawRow(int RowNumber, Dictionary<string, string?> Cells);

    private async Task<List<RawRow>> ParseFileAsync(IFormFile file, CancellationToken ct)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream, ct);
        stream.Position = 0;

        return ext == ".xlsx"
            ? ParseXlsx(stream, file.FileName)
            : ParseCsv(stream);
    }

    private List<RawRow> ParseXlsx(Stream stream, string fileName)
    {
        try
        {
            using var wb = new XLWorkbook(stream);
            var ws = wb.Worksheets.First();
            var headerRow = ws.Row(1);

            // Build column index → canonical field name
            var colMap = new Dictionary<int, string>();
            foreach (var cell in headerRow.CellsUsed())
            {
                var raw = cell.GetString().Trim();
                var normalized = NormalizeHeader(raw);
                if (ColumnAliases.TryGetValue(normalized, out var fieldName))
                    colMap[cell.Address.ColumnNumber] = fieldName;
            }

            var rows = new List<RawRow>();
            var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

            for (int r = 2; r <= lastRow; r++)
            {
                var row = ws.Row(r);
                // Skip entirely empty rows
                if (!row.CellsUsed().Any()) continue;

                var cells = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
                foreach (var (col, field) in colMap)
                {
                    var val = row.Cell(col).GetString().Trim();
                    cells[field] = string.IsNullOrEmpty(val) ? null : val;
                }
                rows.Add(new RawRow(r - 1, cells));
            }
            return rows;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Excel dosyası okunamadı: {ex.Message}", ex);
        }
    }

    private List<RawRow> ParseCsv(Stream stream)
    {
        var rows = new List<RawRow>();
        stream.Position = 0;
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: true);

        string? headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine)) return rows;

        // Auto-detect separator
        char sep = headerLine.Contains(';') ? ';' : ',';
        var headers = SplitCsvLine(headerLine, sep);

        var colMap = new Dictionary<int, string>();
        for (int i = 0; i < headers.Count; i++)
        {
            var normalized = NormalizeHeader(headers[i].Trim());
            if (ColumnAliases.TryGetValue(normalized, out var fieldName))
                colMap[i] = fieldName;
        }

        int rowNum = 0;
        while (!reader.EndOfStream)
        {
            var line = reader.ReadLine();
            if (string.IsNullOrWhiteSpace(line)) continue;

            rowNum++;
            var parts = SplitCsvLine(line, sep);
            var cells = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

            foreach (var (col, field) in colMap)
            {
                if (col < parts.Count)
                {
                    var val = parts[col].Trim();
                    cells[field] = string.IsNullOrEmpty(val) ? null : val;
                }
            }

            rows.Add(new RawRow(rowNum, cells));
        }

        return rows;
    }

    private static List<string> SplitCsvLine(string line, char sep)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == sep && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
        result.Add(current.ToString());
        return result;
    }

    private void MapRawRow(Dictionary<string, string?> cells, ParsedImportRow row)
    {
        if (cells.TryGetValue("Sku", out var sku)) row.Sku = sku?.Trim();
        if (cells.TryGetValue("Name", out var name)) row.Name = name?.Trim();
        if (cells.TryGetValue("Description", out var desc)) row.Description = desc?.Trim();
        if (cells.TryGetValue("Brand", out var brand)) row.BrandName = brand?.Trim();
        if (cells.TryGetValue("Category", out var cat)) row.CategoryName = cat?.Trim();
        if (cells.TryGetValue("Barcode", out var barcode)) row.Barcode = barcode?.Trim();
        if (cells.TryGetValue("PartNumber", out var partNo)) row.PartNumber = partNo?.Trim();
        if (cells.TryGetValue("WarrantyInfo", out var warranty)) row.WarrantyInfo = warranty?.Trim();
        if (cells.TryGetValue("Dimensions", out var dims)) row.Dimensions = dims?.Trim();

        if (cells.TryGetValue("Price", out var priceStr) && !string.IsNullOrWhiteSpace(priceStr))
            row.Price = ParsePrice(priceStr, row.Issues, row.RowNumber);

        if (cells.TryGetValue("Stock", out var stockStr) && !string.IsNullOrWhiteSpace(stockStr))
            row.Stock = ParseStock(stockStr, row.Issues, row.RowNumber);

        if (cells.TryGetValue("WeightKg", out var weightStr) && !string.IsNullOrWhiteSpace(weightStr))
        {
            if (decimal.TryParse(weightStr!.Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var w))
                row.WeightKg = w;
        }

        if (cells.TryGetValue("IsActive", out var activeStr))
            row.IsActive = ParseIsActive(activeStr);
    }

    private static decimal? ParsePrice(string? raw, List<string> issues, int rowNum)
    {
        var result = ImportParseHelper.ParsePrice(raw, out var error);
        if (error != null) issues.Add($"Satır {rowNum}: {error}");
        return result;
    }

    private static int? ParseStock(string? raw, List<string> issues, int rowNum)
    {
        var result = ImportParseHelper.ParseStock(raw, out var error);
        if (error != null) issues.Add($"Satır {rowNum}: {error}");
        return result;
    }

    private static bool ParseIsActive(string? raw) => ImportParseHelper.ParseIsActive(raw);
    private static string NormalizeHeader(string header) => ImportParseHelper.NormalizeHeader(header);
    private static string NormalizeForLookup(string value) => ImportParseHelper.NormalizeForLookup(value);

    private async Task<Dictionary<string, Guid>> LoadBrandsAsync(CancellationToken ct)
    {
        var brands = await _db.Brands.AsNoTracking().Select(b => new { b.Id, b.Name }).ToListAsync(ct);
        return brands.ToDictionary(b => NormalizeForLookup(b.Name), b => b.Id, StringComparer.OrdinalIgnoreCase);
    }

    private async Task<Dictionary<string, Guid>> LoadCategoriesAsync(CancellationToken ct)
    {
        var cats = await _db.Categories.AsNoTracking().Select(c => new { c.Id, c.Name }).ToListAsync(ct);
        return cats.ToDictionary(c => NormalizeForLookup(c.Name), c => c.Id, StringComparer.OrdinalIgnoreCase);
    }

    private record ExistingProduct(Guid Id, decimal Price, int StockQty, bool IsActive, string Name);

    private async Task<Dictionary<string, ExistingProduct>> LoadExistingSkusAsync(CancellationToken ct)
    {
        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Stock)
            .Where(p => p.SKU != null)
            .Select(p => new
            {
                p.Id,
                p.SKU,
                p.Price,
                p.IsActive,
                p.Name,
                StockQty = p.Stock != null ? p.Stock.Quantity : 0
            })
            .ToListAsync(ct);

        var dict = new Dictionary<string, ExistingProduct>(StringComparer.OrdinalIgnoreCase);
        foreach (var p in products)
        {
            if (!string.IsNullOrWhiteSpace(p.SKU))
                dict[p.SKU] = new ExistingProduct(p.Id, p.Price, p.StockQty, p.IsActive, p.Name);
        }
        return dict;
    }

    private ImportPreviewResponseDto BuildPreviewResponse(List<ParsedImportRow> rows, string importType, bool allowOverwriteWithEmpty)
    {
        var token = Guid.NewGuid().ToString("N");
        var cached = new CachedImportData
        {
            ImportType = importType,
            AllowOverwriteWithEmpty = allowOverwriteWithEmpty,
            Rows = rows,
        };
        _cache.Set(token, cached, CacheDuration);

        // Sort: errors first, then rest
        var displayRows = rows
            .OrderBy(r => r.Status == ImportRowStatus.Error ? 0 : r.Status == ImportRowStatus.Duplicate ? 1 : 2)
            .Take(500)
            .Select(r => new ImportRowPreviewDto
            {
                RowNumber = r.RowNumber,
                Status = r.Status.ToString(),
                Sku = r.Sku,
                Name = r.Name,
                BrandName = r.BrandName,
                CategoryName = r.CategoryName,
                Price = r.Price,
                Stock = r.Stock,
                Issues = r.Issues,
            })
            .ToList();

        return new ImportPreviewResponseDto
        {
            PreviewToken = token,
            Total = rows.Count,
            New = rows.Count(r => r.Status == ImportRowStatus.New),
            Update = rows.Count(r => r.Status == ImportRowStatus.Update),
            Unchanged = rows.Count(r => r.Status == ImportRowStatus.Unchanged),
            Error = rows.Count(r => r.Status == ImportRowStatus.Error),
            Duplicate = rows.Count(r => r.Status == ImportRowStatus.Duplicate),
            Rows = displayRows,
        };
    }

    private static void ParseDimensions(string? dimensions, Product product)
    {
        if (string.IsNullOrWhiteSpace(dimensions)) return;

        // Expect format like "10x5x3" or "10X5X3"
        var parts = dimensions.Split(new[] { 'x', 'X', '*', ',' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length >= 3)
        {
            if (decimal.TryParse(parts[0].Trim().Replace(",", "."), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var w))
                product.WidthCm = w;
            if (decimal.TryParse(parts[1].Trim().Replace(",", "."), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var h))
                product.HeightCm = h;
            if (decimal.TryParse(parts[2].Trim().Replace(",", "."), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var l))
                product.LengthCm = l;
        }
    }

    private static string GenerateUniqueSlug(string name, HashSet<string> existingSlugs)
    {
        var baseSlug = GenerateSlug(name);
        var slug = baseSlug;
        int counter = 2;
        while (existingSlugs.Contains(slug))
        {
            slug = $"{baseSlug}-{counter++}";
        }
        return slug;
    }

    private static string GenerateSlug(string name) => ImportParseHelper.GenerateSlug(name);

    private async Task CreateStockRecordsAsync(List<Product> products, List<ParsedImportRow> allRows, CancellationToken ct)
    {
        var rowsBySku = allRows
            .Where(r => r.Sku != null && r.Stock.HasValue)
            .ToDictionary(r => r.Sku!, r => r.Stock!.Value, StringComparer.OrdinalIgnoreCase);

        var stocks = new List<Stock>();
        foreach (var product in products)
        {
            int qty = 0;
            if (!string.IsNullOrWhiteSpace(product.SKU) && rowsBySku.TryGetValue(product.SKU, out var q))
                qty = q;

            stocks.Add(new Stock
            {
                ProductId = product.Id,
                Quantity = qty,
                ReservedQuantity = 0,
                MinimumStockLevel = 0,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        if (stocks.Count > 0)
        {
            _db.Stocks.AddRange(stocks);
            await _db.SaveChangesAsync(ct);
        }
    }
}
