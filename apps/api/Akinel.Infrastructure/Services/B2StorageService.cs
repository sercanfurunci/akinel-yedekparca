using Akinel.Application.Services;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Akinel.Infrastructure.Services;

public class B2StorageService : IStorageService, IDisposable
{
    private readonly AmazonS3Client _client;
    private readonly string _bucketName;
    private readonly string _endpoint;

    public B2StorageService(IConfiguration configuration)
    {
        _endpoint = configuration["B2:Endpoint"] ?? "s3.eu-central-003.backblazeb2.com";
        _bucketName = configuration["B2:BucketName"] ?? "akinel-uploads";
        var keyId = configuration["B2:KeyId"] ?? "";
        var appKey = configuration["B2:ApplicationKey"] ?? "";

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_endpoint}",
            ForcePathStyle = true,
        };
        _client = new AmazonS3Client(new BasicAWSCredentials(keyId, appKey), config);
    }

    public async Task<string> UploadAsync(IFormFile file, string folder, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var key = $"uploads/{folder}/{Guid.NewGuid()}{ext}";

        using var stream = file.OpenReadStream();
        await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType,
            DisablePayloadSigning = true,
        }, ct);

        // return the internal key — served via /api/files/{key}
        return $"/api/files/{key}";
    }

    public async Task DeleteAsync(string? fileUrl, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;

        // extract key from /api/files/{key}
        const string prefix = "/api/files/";
        if (!fileUrl.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return;
        var key = fileUrl[prefix.Length..];

        try { await _client.DeleteObjectAsync(_bucketName, key, ct); } catch { }
    }

    public string GetPresignedUrl(string fileKey, int expiryMinutes = 60)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Protocol = Protocol.HTTPS,
        };
        return _client.GetPreSignedURL(request);
    }

    public void Dispose() => _client.Dispose();
}
