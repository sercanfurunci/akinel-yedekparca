using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Akinel.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;

namespace Akinel.Infrastructure.Services;

public class B2StorageService : IStorageService
{
    private readonly string _keyId;
    private readonly string _applicationKey;
    private readonly string _bucketName;
    private readonly string? _cdnUrl;
    private readonly HttpClient _http = new();
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly ILogger<B2StorageService> _logger;

    private string? _authToken;
    private string? _apiUrl;
    private string? _downloadUrl;
    private string? _bucketId;
    private string? _accountId;
    private DateTime _authExpiry = DateTime.MinValue;

    public B2StorageService(IConfiguration configuration, ILogger<B2StorageService> logger)
    {
        _keyId = configuration["B2:KeyId"] ?? "";
        _applicationKey = configuration["B2:ApplicationKey"] ?? "";
        _bucketName = (configuration["B2:BucketName"] ?? "akinel-uploads").Trim();
        _bucketId = configuration["B2:BucketId"]?.Trim();
        _cdnUrl = configuration["B2:CdnUrl"]?.Trim().TrimEnd('/');
        _logger = logger;
    }

    private string FileUrl(string key) =>
        $"{(_cdnUrl ?? _downloadUrl)}/file/{_bucketName}/{key}";

    private async Task AuthorizeAsync(CancellationToken ct)
    {
        if (_authToken != null && DateTime.UtcNow < _authExpiry) return;
        await _lock.WaitAsync(ct);
        try
        {
            if (_authToken != null && DateTime.UtcNow < _authExpiry) return;

            var creds = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_keyId}:{_applicationKey}"));
            using var req = new HttpRequestMessage(HttpMethod.Get, "https://api.backblazeb2.com/b2api/v3/b2_authorize_account");
            req.Headers.Authorization = new AuthenticationHeaderValue("Basic", creds);

            using var resp = await _http.SendAsync(req, ct);
            resp.EnsureSuccessStatusCode();

            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            var root = doc.RootElement;
            _authToken = root.GetProperty("authorizationToken").GetString()!;
            _accountId = root.GetProperty("accountId").GetString()!;
            var api = root.GetProperty("apiInfo").GetProperty("storageApi");
            _apiUrl = api.GetProperty("apiUrl").GetString()!;
            _downloadUrl = api.GetProperty("downloadUrl").GetString()!;

            if (_bucketId == null &&
                api.TryGetProperty("bucketId", out var bid) &&
                bid.ValueKind == JsonValueKind.String)
                _bucketId = bid.GetString();

            _authExpiry = DateTime.UtcNow.AddHours(23);
        }
        finally { _lock.Release(); }
    }

    private HttpRequestMessage AuthorizedRequest(HttpMethod method, string url)
    {
        var req = new HttpRequestMessage(method, url);
        req.Headers.TryAddWithoutValidation("Authorization", _authToken);
        return req;
    }

    private async Task EnsureBucketIdAsync(CancellationToken ct)
    {
        if (_bucketId != null) return;
        using var req = AuthorizedRequest(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_list_buckets");
        req.Content = new StringContent(JsonSerializer.Serialize(new { accountId = _accountId, bucketName = _bucketName }), Encoding.UTF8, "application/json");
        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
        foreach (var b in doc.RootElement.GetProperty("buckets").EnumerateArray())
            if (b.GetProperty("bucketName").GetString() == _bucketName)
            { _bucketId = b.GetProperty("bucketId").GetString(); break; }
    }

    private static readonly HashSet<string> _imageExts =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff" };

    private static async Task<(byte[] bytes, string ext, string contentType)> ProcessFileAsync(
        IFormFile file, CancellationToken ct)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!_imageExts.Contains(ext))
        {
            using var raw = new MemoryStream();
            await file.CopyToAsync(raw, ct);
            return (raw.ToArray(), ext, file.ContentType ?? "application/octet-stream");
        }

        using var input = new MemoryStream();
        await file.CopyToAsync(input, ct);
        input.Position = 0;

        using var image = await Image.LoadAsync(input, ct);

        // Resize if wider or taller than 1200px, preserving aspect ratio
        if (image.Width > 1200 || image.Height > 1200)
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(1200, 1200),
                Mode = ResizeMode.Max,
            }));

        using var output = new MemoryStream();
        await image.SaveAsWebpAsync(output, new WebpEncoder { Quality = 82 }, ct);
        return (output.ToArray(), ".webp", "image/webp");
    }

    public async Task<string> UploadAsync(IFormFile file, string folder, CancellationToken ct = default)
    {
        await AuthorizeAsync(ct);
        await EnsureBucketIdAsync(ct);

        // Get upload URL
        using var urlReq = AuthorizedRequest(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_get_upload_url");
        urlReq.Content = new StringContent(JsonSerializer.Serialize(new { bucketId = _bucketId }), Encoding.UTF8, "application/json");
        using var urlResp = await _http.SendAsync(urlReq, ct);
        urlResp.EnsureSuccessStatusCode();

        using var urlDoc = JsonDocument.Parse(await urlResp.Content.ReadAsStringAsync(ct));
        var uploadUrl = urlDoc.RootElement.GetProperty("uploadUrl").GetString()!;
        var uploadToken = urlDoc.RootElement.GetProperty("authorizationToken").GetString()!;

        // Process (compress + convert) and compute SHA1
        var (bytes, ext, contentType) = await ProcessFileAsync(file, ct);
        var key = $"uploads/{folder}/{Guid.NewGuid()}{ext}";
        var sha1 = Convert.ToHexString(SHA1.HashData(bytes)).ToLowerInvariant();

        // Upload
        using var uploadReq = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
        uploadReq.Headers.TryAddWithoutValidation("Authorization", uploadToken);
        uploadReq.Headers.TryAddWithoutValidation("X-Bz-File-Name", Uri.EscapeDataString(key));
        uploadReq.Headers.TryAddWithoutValidation("X-Bz-Content-Sha1", sha1);
        uploadReq.Content = new ByteArrayContent(bytes);
        uploadReq.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var uploadResp = await _http.SendAsync(uploadReq, ct);
        uploadResp.EnsureSuccessStatusCode();

        // CdnUrl = S3-compatible base (e.g. https://bucket.s3.region.backblazeb2.com) → no /file/bucket prefix
        // No CdnUrl = native B2 download URL → /file/bucket/key
        return _cdnUrl != null
            ? $"{_cdnUrl}/{key}"
            : $"{_downloadUrl}/file/{_bucketName}/{key}";
    }

    private string? ExtractKey(string fileUrl)
    {
        // new format: https://f003.backblazeb2.com/file/akinel-uploads/{key}
        var bucketPrefix = $"/file/{_bucketName}/";
        var idx = fileUrl.IndexOf(bucketPrefix, StringComparison.OrdinalIgnoreCase);
        // strip CDN or B2 host prefix
        if (idx >= 0) return fileUrl[(idx + bucketPrefix.Length)..];
        // old format: /api/files/{key}
        const string apiPrefix = "/api/files/";
        if (fileUrl.StartsWith(apiPrefix, StringComparison.OrdinalIgnoreCase)) return fileUrl[apiPrefix.Length..];
        return null;
    }

    public async Task DeleteAsync(string? fileUrl, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;
        var key = ExtractKey(fileUrl);
        if (key == null) return;

        try
        {
            await AuthorizeAsync(ct);
            await EnsureBucketIdAsync(ct);

            using var listReq = AuthorizedRequest(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_list_file_names");
            listReq.Content = new StringContent(
                JsonSerializer.Serialize(new { bucketId = _bucketId, prefix = key, maxFileCount = 1 }),
                Encoding.UTF8, "application/json");
            using var listResp = await _http.SendAsync(listReq, ct);
            if (!listResp.IsSuccessStatusCode) return;

            using var listDoc = JsonDocument.Parse(await listResp.Content.ReadAsStringAsync(ct));
            var files = listDoc.RootElement.GetProperty("files");
            if (files.GetArrayLength() == 0) return;

            var fileId = files[0].GetProperty("fileId").GetString()!;
            var fileName = files[0].GetProperty("fileName").GetString()!;

            using var delReq = AuthorizedRequest(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_delete_file_version");
            delReq.Content = new StringContent(JsonSerializer.Serialize(new { fileId, fileName }), Encoding.UTF8, "application/json");
            await _http.SendAsync(delReq, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "B2 dosya silme başarısız: {FileUrl}", fileUrl);
        }
    }

    public async Task<string> GetPresignedUrlAsync(string fileKey, CancellationToken ct = default)
    {
        await AuthorizeAsync(ct);
        return _cdnUrl != null
            ? $"{_cdnUrl}/{fileKey}"
            : $"{_downloadUrl}/file/{_bucketName}/{fileKey}";
    }
}
