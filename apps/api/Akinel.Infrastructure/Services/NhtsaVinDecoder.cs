using System.Text.Json;
using Akinel.Application.Services;
using Microsoft.Extensions.Logging;

namespace Akinel.Infrastructure.Services;

public class NhtsaVinDecoder : IVinDecoder
{
    private readonly HttpClient _http;
    private readonly ILogger<NhtsaVinDecoder> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

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
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("Results", out var results) || results.ValueKind != JsonValueKind.Array)
                return null;

            var items = results.EnumerateArray().ToList();
            if (items.Count == 0) return null;

            var r = items[0];

            var make = GetValue(r, "Make");
            var model = GetValue(r, "Model");

            // If make is empty, vehicle is unknown
            if (string.IsNullOrWhiteSpace(make))
                return null;

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
            return null;
        }
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
