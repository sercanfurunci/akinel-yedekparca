using System.Text.Json;
using Akinel.Application.Services;
using Microsoft.Extensions.Logging;

namespace Akinel.Infrastructure.Services;

public class NhtsaVinDecoder : IVinDecoder
{
    private readonly HttpClient _http;
    private readonly ILogger<NhtsaVinDecoder> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    // WMI (World Manufacturer Identifier) = first 3 chars of VIN.
    // Used as fallback when NHTSA returns no result (common for European vehicles).
    private static readonly Dictionary<string, string> WmiLookup = new(StringComparer.OrdinalIgnoreCase)
    {
        // German
        { "WAU", "Audi" }, { "WA1", "Audi" },
        { "WBA", "BMW" }, { "WBS", "BMW" }, { "WBX", "BMW" },
        { "WDB", "Mercedes-Benz" }, { "WDC", "Mercedes-Benz" }, { "WDD", "Mercedes-Benz" },
        { "WVW", "Volkswagen" }, { "WV2", "Volkswagen" }, { "WV3", "Volkswagen" },
        { "W0L", "Opel" },
        { "WF0", "Ford" },
        // French
        { "VF1", "Renault" }, { "VF3", "Peugeot" }, { "VF6", "Peugeot" },
        { "VF7", "Citroën" }, { "VF8", "Citroën" },
        { "VNK", "Toyota (France)" },
        // Italian
        { "ZAR", "Alfa Romeo" }, { "ZBF", "Ferrari" }, { "ZCG", "Fiat" },
        { "ZDF", "Fiat" }, { "ZFA", "Fiat" }, { "ZFF", "Ferrari" },
        // Japanese
        { "JHM", "Honda" }, { "JN1", "Nissan" }, { "JN6", "Nissan" },
        { "JT2", "Toyota" }, { "JT3", "Toyota" },
        // Korean
        { "KMH", "Hyundai" }, { "KNA", "Kia" }, { "KNM", "Renault Samsung" },
        // Turkish VINs
        { "NM0", "Ford (Turkey)" }, { "NM4", "Ford (Turkey)" },
        // Swedish
        { "YV1", "Volvo" }, { "YV4", "Volvo" }, { "SCC", "Saab" },
        // Czech / Spanish
        { "TMB", "Škoda" }, { "VSS", "SEAT" },
        // Romanian
        { "UU1", "Dacia" },
    };

    // VIN position 10 (0-indexed = char[9]) encodes model year.
    // Cycle: A=1980..H=1987, J=1988..N=1992, P=1993, R=1994..Y=2000,
    //        1=2001..9=2009, then repeats A=2010..
    private static readonly Dictionary<char, int> VinYearCode = new()
    {
        { 'A', 1980 }, { 'B', 1981 }, { 'C', 1982 }, { 'D', 1983 }, { 'E', 1984 },
        { 'F', 1985 }, { 'G', 1986 }, { 'H', 1987 }, { 'J', 1988 }, { 'K', 1989 },
        { 'L', 1990 }, { 'M', 1991 }, { 'N', 1992 }, { 'P', 1993 }, { 'R', 1994 },
        { 'S', 1995 }, { 'T', 1996 }, { 'V', 1997 }, { 'W', 1998 }, { 'X', 1999 },
        { 'Y', 2000 }, { '1', 2001 }, { '2', 2002 }, { '3', 2003 }, { '4', 2004 },
        { '5', 2005 }, { '6', 2006 }, { '7', 2007 }, { '8', 2008 }, { '9', 2009 },
    };

    // Decode year from VIN char[9]. The 30-char cycle repeats: A=1980/2010, B=1981/2011, etc.
    private static string? DecodeModelYear(string vin)
    {
        var c = vin[9];
        if (!VinYearCode.TryGetValue(c, out var baseYear)) return null;
        // Determine cycle: chars 1-9 (digits) map to 2001-2009 only; letters may be 1980-cycle or 2010-cycle.
        // Heuristic: if base year < 2010, also consider +30.
        // We pick the cycle that results in a plausible year (not in the future, not before 1980).
        var currentYear = DateTime.UtcNow.Year;
        var candidate = baseYear <= 2009 ? baseYear + 30 : baseYear;
        // If +30 is still in the future or >2 years ahead, use base year
        if (candidate > currentYear + 1) candidate = baseYear;
        return candidate.ToString();
    }

    public NhtsaVinDecoder(HttpClient http, ILogger<NhtsaVinDecoder> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<VinDecodeResult?> DecodeAsync(string vin, CancellationToken ct = default)
    {
        vin = vin.Trim().ToUpperInvariant();
        if (vin.Length != 17) return null;

        try
        {
            var url = $"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{Uri.EscapeDataString(vin)}?format=json";
            var response = await _http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("NHTSA VIN decode failed with status {Status} for VIN {Vin}", response.StatusCode, vin);
                return TryWmiFallback(vin);
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("Results", out var results) || results.ValueKind != JsonValueKind.Array)
                return TryWmiFallback(vin);

            var items = results.EnumerateArray().ToList();
            if (items.Count == 0) return TryWmiFallback(vin);

            var r = items[0];

            var make = GetValue(r, "Make");
            var model = GetValue(r, "Model");

            // If make is empty, fall back to WMI lookup
            if (string.IsNullOrWhiteSpace(make))
                return TryWmiFallback(vin);

            var year = GetValue(r, "ModelYear");
            var engineCode = GetValue(r, "EngineModel");
            var fuelType = GetValue(r, "FuelTypePrimary");
            var displacementL = GetValue(r, "DisplacementL");
            var transmission = GetValue(r, "TransmissionStyle");
            var bodyClass = GetValue(r, "BodyClass");
            var trim = GetValue(r, "Trim");
            var country = GetValue(r, "PlantCountry");
            var manufacturer = GetValue(r, "Manufacturer");

            // Normalize fuel type to Turkish-friendly English
            fuelType = NormalizeFuelType(fuelType);

            // Normalize displacement — round to 1 decimal
            var displacementDisplay = ParseDisplacement(displacementL);

            var isPartial = string.IsNullOrWhiteSpace(year) || string.IsNullOrWhiteSpace(model);

            return new VinDecodeResult
            {
                Vin = vin,
                Make = make,
                Model = model,
                Year = year,
                EngineCode = string.IsNullOrWhiteSpace(engineCode) ? null : engineCode,
                FuelType = string.IsNullOrWhiteSpace(fuelType) ? null : fuelType,
                Displacement = displacementDisplay,
                Transmission = string.IsNullOrWhiteSpace(transmission) ? null : transmission,
                BodyStyle = string.IsNullOrWhiteSpace(bodyClass) ? null : bodyClass,
                Trim = string.IsNullOrWhiteSpace(trim) ? null : trim,
                Country = string.IsNullOrWhiteSpace(country) ? null : country,
                ManufacturerName = string.IsNullOrWhiteSpace(manufacturer) ? null : manufacturer,
                IsPartial = isPartial,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Exception while decoding VIN {Vin}", vin);
            return TryWmiFallback(vin);
        }
    }

    private static VinDecodeResult? TryWmiFallback(string vin)
    {
        var wmi = vin[..3];
        if (!WmiLookup.TryGetValue(wmi, out var manufacturer)) return null;

        var year = DecodeModelYear(vin);

        return new VinDecodeResult
        {
            Vin = vin,
            Make = manufacturer,
            Model = null,
            Year = year,
            EngineCode = null,
            FuelType = null,
            Displacement = null,
            Transmission = null,
            BodyStyle = null,
            Trim = null,
            Country = null,
            ManufacturerName = manufacturer,
            IsPartial = true,
        };
    }

    private static string? GetValue(JsonElement element, string key)
    {
        if (!element.TryGetProperty(key, out var val)) return null;
        var s = val.GetString();
        return string.IsNullOrWhiteSpace(s) || s == "0" ? null : s;
    }

    private static string? NormalizeFuelType(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var lower = raw.ToLowerInvariant();
        if (lower.Contains("diesel")) return "Diesel";
        if (lower.Contains("gasoline") || lower.Contains("petrol") || lower.Contains("benzin")) return "Gasoline";
        if (lower.Contains("electric")) return "Electric";
        if (lower.Contains("hybrid")) return "Hybrid";
        if (lower.Contains("lpg") || lower.Contains("gas")) return "LPG";
        return raw;
    }

    private static string? ParseDisplacement(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        if (decimal.TryParse(raw, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var d))
        {
            return Math.Round(d, 1).ToString("0.0", System.Globalization.CultureInfo.InvariantCulture);
        }
        return raw;
    }
}
