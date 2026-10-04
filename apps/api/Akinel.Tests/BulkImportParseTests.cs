using Akinel.Application.DTOs;
using FluentAssertions;

namespace Akinel.Tests;

public class BulkImportParseTests
{
    // ── ParsePrice – Turkish decimal formats ─────────────────────────────────
    //
    // Turkish locale uses:
    //   '.' as the thousands separator  →  1.290 means one thousand two hundred ninety
    //   ',' as the decimal separator    →  ,50 means fifty cents
    //
    // So "1.290,50" = 1290.50  (NOT 12500.99 or any other value)
    //    "12.500,99" = 12500.99
    //    "1.000.000,00" would be 1000000.00
    //
    // English locale is the opposite: ',' thousands, '.' decimal.

    [Theory]
    [InlineData("1.290,50",   1290.50)]   // Turkish: dot=thousands, comma=decimal
    [InlineData("12.500,99",  12500.99)]  // Turkish: 12 thousands + 500 + .99
    [InlineData("1.000,00",   1000.00)]   // Turkish: exactly 1000
    [InlineData("850,00",     850.00)]    // Turkish: no thousands sep
    [InlineData("1,290.50",   1290.50)]   // English: comma=thousands, dot=decimal
    [InlineData("12,500.99",  12500.99)]  // English: 12 thousands + 500 + .99
    public void ParsePrice_WithThousandsSeparator_CorrectResult(string raw, decimal expected)
    {
        var result = ImportParseHelper.ParsePrice(raw, out var error);
        result.Should().Be(expected, because: $"'{raw}' should parse to {expected}");
        error.Should().BeNull();
    }

    [Theory]
    [InlineData("1290",      1290.00)]   // integer, no separator
    [InlineData("1290.50",   1290.50)]   // dot as decimal only
    [InlineData("1290,50",   1290.50)]   // comma as decimal only (Turkish short form)
    [InlineData("850",       850.00)]
    [InlineData("0.99",      0.99)]
    [InlineData("  125,00 ", 125.00)]    // leading/trailing whitespace
    [InlineData("0",         0.00)]
    public void ParsePrice_SimpleFormats_ReturnsCorrectDecimal(string raw, decimal expected)
    {
        var result = ImportParseHelper.ParsePrice(raw, out var error);
        result.Should().Be(expected);
        error.Should().BeNull();
    }

    /// <summary>
    /// Critical regression guard: "1.290,50" must be 1290.50, not anything else.
    /// </summary>
    [Fact]
    public void ParsePrice_Turkish_1290_50_Is_1290point50()
    {
        var result = ImportParseHelper.ParsePrice("1.290,50", out var error);
        result.Should().Be(1290.50m);
        error.Should().BeNull();
    }

    /// <summary>
    /// Another critical case: "12.500,99" is twelve thousand five hundred point ninety-nine.
    /// </summary>
    [Fact]
    public void ParsePrice_Turkish_12500_99_Is_12500point99()
    {
        var result = ImportParseHelper.ParsePrice("12.500,99", out var error);
        result.Should().Be(12500.99m);
        error.Should().BeNull();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ParsePrice_EmptyOrNull_ReturnsNull(string? raw)
    {
        var result = ImportParseHelper.ParsePrice(raw, out var error);
        result.Should().BeNull();
        error.Should().BeNull();
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("--")]
    [InlineData("1,2,3")]
    public void ParsePrice_InvalidFormat_ReturnsNullWithError(string raw)
    {
        var result = ImportParseHelper.ParsePrice(raw, out var error);
        result.Should().BeNull();
        error.Should().NotBeNullOrEmpty();
        error.Should().Contain(raw);
    }

    [Fact]
    public void ParsePrice_NegativeValue_ParsesWithoutError()
    {
        // The parser itself does not reject negatives; callers validate > 0
        var result = ImportParseHelper.ParsePrice("-100", out var error);
        result.Should().Be(-100m);
        error.Should().BeNull();
    }

    // ── ParseStock ────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("0",    0)]
    [InlineData("1",    1)]
    [InlineData("14",   14)]
    [InlineData("9999", 9999)]
    [InlineData("14.5", 14)]   // truncates — not rounded
    [InlineData("9.9",  9)]    // 9.9 → 9, not 10
    [InlineData("14,5", 14)]   // Turkish decimal truncated
    public void ParseStock_ValidValues_ReturnsInteger(string raw, int expected)
    {
        var result = ImportParseHelper.ParseStock(raw, out var error);
        result.Should().Be(expected);
        error.Should().BeNull();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public void ParseStock_EmptyOrNull_ReturnsNull(string? raw)
    {
        var result = ImportParseHelper.ParseStock(raw, out var error);
        result.Should().BeNull();
        error.Should().BeNull();
    }

    [Theory]
    [InlineData("-1")]
    [InlineData("-999")]
    [InlineData("abc")]
    [InlineData("two")]
    public void ParseStock_InvalidValues_ReturnsNullWithError(string raw)
    {
        var result = ImportParseHelper.ParseStock(raw, out var error);
        result.Should().BeNull();
        error.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void ParseStock_Zero_ReturnsZero()
    {
        var result = ImportParseHelper.ParseStock("0", out var error);
        result.Should().Be(0);
        error.Should().BeNull();
    }

    [Fact]
    public void ParseStock_DecimalInput_TruncatesNotRounds()
    {
        // "9.9" must give 9, not 10 (we truncate, not round)
        var result = ImportParseHelper.ParseStock("9.9", out _);
        result.Should().Be(9);
    }

    // ── ParseIsActive ─────────────────────────────────────────────────────────

    [Theory]
    [InlineData("1",     true)]
    [InlineData("true",  true)]
    [InlineData("True",  true)]
    [InlineData("TRUE",  true)]
    [InlineData("yes",   true)]
    [InlineData("evet",  true)]
    [InlineData("aktif", true)]
    [InlineData("",      true)]   // default is active
    [InlineData(null,    true)]
    public void ParseIsActive_TrueValues(string? raw, bool expected)
    {
        ImportParseHelper.ParseIsActive(raw).Should().Be(expected);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("false")]
    [InlineData("False")]
    [InlineData("FALSE")]
    [InlineData("no")]
    [InlineData("hayir")]
    [InlineData("pasif")]
    public void ParseIsActive_FalseValues(string raw)
    {
        ImportParseHelper.ParseIsActive(raw).Should().BeFalse();
    }

    // ── NormalizeHeader ───────────────────────────────────────────────────────

    [Theory]
    [InlineData("Ürün Adı",    "urun adi")]
    [InlineData("STOK KODU",   "stok kodu")]
    [InlineData("Fiyat",       "fiyat")]
    [InlineData("Ağırlık kg",  "agirlik kg")]
    [InlineData("  Kategori ", "kategori")]
    [InlineData("Açıklama",    "aciklama")]
    [InlineData("Şirket",      "sirket")]
    [InlineData("Güncelleme",  "guncelleme")]
    public void NormalizeHeader_TurkishHeaders_NormalizesCorrectly(string input, string expected)
    {
        ImportParseHelper.NormalizeHeader(input).Should().Be(expected);
    }

    // ── NormalizeForLookup ────────────────────────────────────────────────────

    [Theory]
    [InlineData("Bosch",   "bosch")]
    [InlineData("BOSCH",   "bosch")]
    [InlineData("bosch",   "bosch")]
    [InlineData("Şahin",   "sahin")]
    [InlineData("Türkiye", "turkiye")]
    [InlineData(" Ford ",  "ford")]
    [InlineData("ÇELIK",   "celik")]
    public void NormalizeForLookup_CaseInsensitive(string input, string expected)
    {
        ImportParseHelper.NormalizeForLookup(input).Should().Be(expected);
    }

    // ── GenerateSlug ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData("Yağ Filtresi",      "yag-filtresi")]
    [InlineData("Bosch Fren Balata", "bosch-fren-balata")]
    [InlineData("Ürün  Adı",         "urun-adi")]
    [InlineData("Çok Güzel Ürün",    "cok-guzel-urun")]
    [InlineData("ABC 123",           "abc-123")]
    public void GenerateSlug_TurkishNames_ProducesValidSlug(string input, string expected)
    {
        ImportParseHelper.GenerateSlug(input).Should().Be(expected);
    }

    [Fact]
    public void GenerateSlug_SpecialChars_OnlyAlphanumericAndHyphen()
    {
        var slug = ImportParseHelper.GenerateSlug("Ürün (1) — Özel!");
        slug.Should().MatchRegex(@"^[a-z0-9\-]+$");
    }

    [Fact]
    public void GenerateSlug_NoLeadingOrTrailingHyphens()
    {
        var slug = ImportParseHelper.GenerateSlug("  leading-trailing  ");
        slug.Should().NotStartWith("-").And.NotEndWith("-");
    }

    // ── Brand/category matching simulation ────────────────────────────────────

    [Fact]
    public void BrandMatching_CaseInsensitive_AllVariantsMatch()
    {
        var brands = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
        {
            [ImportParseHelper.NormalizeForLookup("Bosch")]  = Guid.NewGuid(),
            [ImportParseHelper.NormalizeForLookup("TRW")]    = Guid.NewGuid(),
            [ImportParseHelper.NormalizeForLookup("Şahin")]  = Guid.NewGuid(),
        };

        brands.ContainsKey(ImportParseHelper.NormalizeForLookup("BOSCH")).Should().BeTrue();
        brands.ContainsKey(ImportParseHelper.NormalizeForLookup("bosch")).Should().BeTrue();
        brands.ContainsKey(ImportParseHelper.NormalizeForLookup("Sahin")).Should().BeTrue("ş normalises to s");
        brands.ContainsKey(ImportParseHelper.NormalizeForLookup("trw")).Should().BeTrue();
        brands.ContainsKey(ImportParseHelper.NormalizeForLookup("Unknown")).Should().BeFalse();
    }

    // ── ImportRowStatus enum ──────────────────────────────────────────────────

    [Fact]
    public void ImportRowStatus_HasExpectedValues()
    {
        Enum.GetNames<ImportRowStatus>()
            .Should().BeEquivalentTo(["New", "Update", "Unchanged", "Error", "Duplicate"]);
    }

    // ── DTO defaults ──────────────────────────────────────────────────────────

    [Fact]
    public void ParsedImportRow_DefaultIsActive_IsTrue()
    {
        var row = new ParsedImportRow();
        row.IsActive.Should().BeTrue();
        row.Issues.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void ParsedImportRow_DoesNotHaveImageUrlOrOemNumber()
    {
        var props = typeof(ParsedImportRow).GetProperties().Select(p => p.Name).ToArray();
        props.Should().NotContain("ImageUrl");
        props.Should().NotContain("OemNumber");
    }

    [Fact]
    public void ImportRowPreviewDto_DoesNotHaveImageUrlOrOemNumber()
    {
        var props = typeof(ImportRowPreviewDto).GetProperties().Select(p => p.Name).ToArray();
        props.Should().NotContain("ImageUrl");
        props.Should().NotContain("OemNumber");
    }

    [Fact]
    public void ImportPreviewResponseDto_DefaultsAreCorrect()
    {
        var dto = new ImportPreviewResponseDto();
        dto.Rows.Should().NotBeNull().And.BeEmpty();
        dto.PreviewToken.Should().BeEmpty();
        dto.Total.Should().Be(0);
    }
}
