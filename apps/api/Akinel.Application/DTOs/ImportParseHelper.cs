using System.Text.RegularExpressions;

namespace Akinel.Application.DTOs;

/// <summary>
/// Pure static parsing helpers for the bulk import system.
/// Extracted here so they can be independently unit-tested.
/// </summary>
public static class ImportParseHelper
{
    /// <summary>
    /// Parses a price value supporting Turkish and English decimal formats.
    /// Examples: "1290", "1290.50", "1290,50", "1.290,50", "1,290.50"
    /// </summary>
    public static decimal? ParsePrice(string? raw, out string? error)
    {
        error = null;
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var normalized = raw.Trim();

        if (normalized.Contains(',') && normalized.Contains('.'))
        {
            int lastComma = normalized.LastIndexOf(',');
            int lastDot   = normalized.LastIndexOf('.');
            if (lastComma > lastDot)
                normalized = normalized.Replace(".", "").Replace(",", ".");  // Turkish: 1.290,50
            else
                normalized = normalized.Replace(",", "");                     // English: 1,290.50
        }
        else if (normalized.Contains(','))
        {
            normalized = normalized.Replace(",", ".");  // Turkish: 1290,50
        }

        if (decimal.TryParse(normalized,
            System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture,
            out var result))
        {
            return result;
        }

        error = $"Geçersiz fiyat formatı: '{raw}'";
        return null;
    }

    /// <summary>
    /// Parses a stock quantity. Returns null and sets error for invalid/negative values.
    /// Truncates decimals (e.g. "14.5" → 14).
    /// </summary>
    public static int? ParseStock(string? raw, out string? error)
    {
        error = null;
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var normalized = raw.Trim().Split('.')[0].Split(',')[0];
        if (int.TryParse(normalized, out var result) && result >= 0) return result;

        error = $"Geçersiz stok değeri: '{raw}'";
        return null;
    }

    /// <summary>
    /// Parses an IsActive flag from various Turkish/English representations.
    /// Defaults to true for empty values.
    /// </summary>
    public static bool ParseIsActive(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return true;
        var lower = raw.Trim().ToLowerInvariant();
        return lower is "1" or "true" or "yes" or "evet" or "aktif";
    }

    /// <summary>
    /// Normalises a column header for alias lookup:
    /// lowercase, Turkish character substitution, trim.
    /// </summary>
    public static string NormalizeHeader(string header)
    {
        return header.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g")
            .Replace("ı", "i").Replace("i̇", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Trim();
    }

    /// <summary>
    /// Normalises a brand/category name for case-insensitive matching.
    /// </summary>
    public static string NormalizeForLookup(string value)
    {
        return value.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g")
            .Replace("ı", "i").Replace("ö", "o")
            .Replace("ş", "s").Replace("ü", "u")
            .Trim();
    }

    /// <summary>
    /// Generates a URL-safe slug from a Turkish product name.
    /// </summary>
    public static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Replace(" ", "-");
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = Regex.Replace(slug, @"-{2,}", "-");
        return slug.Trim('-');
    }
}
