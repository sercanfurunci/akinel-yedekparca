using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Akinel.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Akinel.Infrastructure.Services;

public class B2StorageService : IStorageService
{
    private readonly string _keyId;
    private readonly string _applicationKey;
    private readonly string _bucketName;
    private readonly HttpClient _http = new();
    private readonly SemaphoreSlim _lock = new(1, 1);

    private string? _authToken;
    private string? _apiUrl;
    private string? _downloadUrl;
    private string? _bucketId;
    private DateTime _authExpiry = DateTime.MinValue;

    public B2StorageService(IConfiguration configuration)
    {
        _keyId = configuration["B2:KeyId"] ?? "";
        _applicationKey = configuration["B2:ApplicationKey"] ?? "";
        _bucketName = configuration["B2:BucketName"] ?? "akinel-uploads";
    }

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
            var api = root.GetProperty("apiInfo").GetProperty("storageApi");
            _apiUrl = api.GetProperty("apiUrl").GetString()!;
            _downloadUrl = api.GetProperty("downloadUrl").GetString()!;

            if (api.TryGetProperty("bucketId", out var bid) && bid.ValueKind == JsonValueKind.String)
                _bucketId = bid.GetString();

            _authExpiry = DateTime.UtcNow.AddHours(23);
        }
        finally { _lock.Release(); }
    }

    private async Task EnsureBucketIdAsync(CancellationToken ct)
    {
        if (_bucketId != null) return;
        using var req = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_list_buckets");
        req.Headers.Authorization = new AuthenticationHeaderValue(_authToken!);
        req.Content = new StringContent(JsonSerializer.Serialize(new { bucketName = _bucketName }), Encoding.UTF8, "application/json");
        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
        foreach (var b in doc.RootElement.GetProperty("buckets").EnumerateArray())
            if (b.GetProperty("bucketName").GetString() == _bucketName)
            { _bucketId = b.GetProperty("bucketId").GetString(); break; }
    }

    public async Task<string> UploadAsync(IFormFile file, string folder, CancellationToken ct = default)
    {
        await AuthorizeAsync(ct);
        await EnsureBucketIdAsync(ct);

        // Get upload URL
        using var urlReq = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_get_upload_url");
        urlReq.Headers.Authorization = new AuthenticationHeaderValue(_authToken!);
        urlReq.Content = new StringContent(JsonSerializer.Serialize(new { bucketId = _bucketId }), Encoding.UTF8, "application/json");
        using var urlResp = await _http.SendAsync(urlReq, ct);
        urlResp.EnsureSuccessStatusCode();

        using var urlDoc = JsonDocument.Parse(await urlResp.Content.ReadAsStringAsync(ct));
        var uploadUrl = urlDoc.RootElement.GetProperty("uploadUrl").GetString()!;
        var uploadToken = urlDoc.RootElement.GetProperty("authorizationToken").GetString()!;

        // Read file into memory and compute SHA1
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var key = $"uploads/{folder}/{Guid.NewGuid()}{ext}";
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms, ct);
        var bytes = ms.ToArray();
        var sha1 = Convert.ToHexString(SHA1.HashData(bytes)).ToLowerInvariant();

        // Upload
        using var uploadReq = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
        uploadReq.Headers.Authorization = new AuthenticationHeaderValue(uploadToken);
        uploadReq.Headers.Add("X-Bz-File-Name", Uri.EscapeDataString(key));
        uploadReq.Headers.Add("X-Bz-Content-Sha1", sha1);
        uploadReq.Content = new ByteArrayContent(bytes);
        uploadReq.Content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/octet-stream");

        using var uploadResp = await _http.SendAsync(uploadReq, ct);
        uploadResp.EnsureSuccessStatusCode();

        return $"/api/files/{key}";
    }

    public async Task DeleteAsync(string? fileUrl, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;
        const string prefix = "/api/files/";
        if (!fileUrl.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return;
        var key = fileUrl[prefix.Length..];

        try
        {
            await AuthorizeAsync(ct);
            await EnsureBucketIdAsync(ct);

            using var listReq = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_list_file_names");
            listReq.Headers.Authorization = new AuthenticationHeaderValue(_authToken!);
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

            using var delReq = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}/b2api/v3/b2_delete_file_version");
            delReq.Headers.Authorization = new AuthenticationHeaderValue(_authToken!);
            delReq.Content = new StringContent(JsonSerializer.Serialize(new { fileId, fileName }), Encoding.UTF8, "application/json");
            await _http.SendAsync(delReq, ct);
        }
        catch { }
    }

    public string GetPresignedUrl(string fileKey, int expiryMinutes = 60)
    {
        // B2 download URL with embedded auth token (valid 23h, refreshed on upload)
        return $"{_downloadUrl}/b2api/v3/b2_download_file_by_name?bucketName={_bucketName}&fileName={Uri.EscapeDataString(fileKey)}&Authorization={_authToken}";
    }
}
