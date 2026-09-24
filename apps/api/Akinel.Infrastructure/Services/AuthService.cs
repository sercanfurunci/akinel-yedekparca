using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Akinel.Application.Configuration;
using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Akinel.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AkinelDbContext _context;
    private readonly SessionSettings _session;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public AuthService(AkinelDbContext context, IOptions<SessionSettings> sessionOptions, IOptions<JwtSettings> jwtOptions)
    {
        _context = context;
        _session = sessionOptions.Value;
        _jwtSecret = jwtOptions.Value.Secret;
        _jwtIssuer = jwtOptions.Value.Issuer;
        _jwtAudience = jwtOptions.Value.Audience;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var normalized = request.Email.ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalized && u.IsActive, ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        return await GenerateAuthResponseAsync(user, ct);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var normalized = request.Email.ToUpperInvariant();
        if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalized, ct))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Email = request.Email,
            NormalizedEmail = normalized,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Customer
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);
        return await GenerateAuthResponseAsync(user, ct);
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var token = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.ExpiresAt > now, ct);

        if (token == null) return null;

        // Absolute session timeout (applies to all roles)
        if (token.AbsoluteExpiresAt < now) return null;

        // Idle timeout — applies to admins only
        if (token.User.Role == UserRole.Admin)
        {
            var lastActivity = token.LastUsedAt ?? token.CreatedAt;
            if (now - lastActivity > TimeSpan.FromMinutes(_session.AdminIdleTimeoutMinutes))
                return null;
        }

        token.IsRevoked = true;
        token.RevokedAt = now;
        await _context.SaveChangesAsync(ct);

        // Pass the original absolute expiry so repeated refreshes cannot extend the session beyond it
        return await GenerateAuthResponseAsync(token.User, ct, token.AbsoluteExpiresAt);
    }

    public async Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken, ct);
        if (token == null) return;
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user, CancellationToken ct, DateTime? inheritedAbsoluteExpiry = null)
    {
        var now = DateTime.UtcNow;
        var accessToken = GenerateJwt(user, now);
        var refreshTokenValue = GenerateRefreshToken();

        var idleMinutes = user.Role == UserRole.Admin ? _session.AdminIdleTimeoutMinutes : _session.RefreshTokenDays * 24 * 60;
        var refreshExpiry = now.AddMinutes(idleMinutes);
        // On first login, set the absolute expiry. On refresh, inherit it — never extend it.
        var absoluteExpiry = inheritedAbsoluteExpiry ?? (user.Role == UserRole.Admin
            ? now.AddHours(_session.AdminAbsoluteTimeoutHours)
            : now.AddDays(_session.RefreshTokenDays));

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = refreshExpiry,
            AbsoluteExpiresAt = absoluteExpiry,
            LastUsedAt = now
        });
        await _context.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshTokenValue, now.AddMinutes(_session.AccessTokenMinutes),
            new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role.ToString()));
    }

    private string GenerateJwt(User user, DateTime now)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("firstName", user.FirstName),
        };
        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: now.AddMinutes(_session.AccessTokenMinutes),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
